import { getEmbedding } from './fileHandler';
import OpenAI from 'openai';
import { knowledgeChunk, knowledgeDocument } from '../../db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql, eq, desc, and, inArray } from 'drizzle-orm';
import { getFallbackResults } from './fallbackResults';
import { basicKnowledgeSearch, normalizeText, preprocessQuery } from '../../db/schemaAdapter';

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

// Initialize OpenAI client
const openai = new OpenAI();

// Initialize database client
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Search for relevant document chunks based on a query
 * First tries to use database, then falls back to local similarity if needed
 */
export async function searchKnowledgeLocal(
  query: string,
  userId: string,
  limit: number = 5,
  documentIds?: string[] // Add filter by document IDs
): Promise<any[]> {
  console.log(`[LOCAL SEARCH] Searching knowledge for query: "${query.substring(0, 50)}..."`);
  if (DEBUG_MODE) {
    console.log(`[LOCAL SEARCH] Search details:\n- User ID: ${userId}\n- Limit: ${limit}\n- Document filter: ${documentIds ? `${documentIds.length} docs` : 'none'}\n- Full query: ${query}`);
  }
  if (DEBUG_MODE) {
    console.log(`[LOCAL SEARCH] Search details:\n- User ID: ${userId}\n- Limit: ${limit}\n- Full query: ${query}`);
  }
  
  try {
    // Normalize the query text for better matching, especially for Arabic
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery !== query) {
      console.log(`[LOCAL SEARCH] Normalized query for better matching: "${normalizedQuery.substring(0, 50)}..."`);
    }
    
    // Log database connection info in debug mode
    if (DEBUG_MODE) {
      console.log(`[LOCAL SEARCH] Database connection string: ${process.env.POSTGRES_URL?.replace(/:[^:@]*@/, ':***@')}`);
      try {
        const testResult = await db.execute(sql`SELECT current_database() as db_name`);
        console.log(`[LOCAL SEARCH] Connected to database: ${testResult[0]?.db_name || 'unknown'}`);
      } catch (dbConnError) {
        console.error('[LOCAL SEARCH] Database connection test failed:', dbConnError);
      }
      
      // List all tables to debug database schema issues
      try {
        const tables = await db.execute(sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        console.log(`[LOCAL SEARCH] Available tables in database: ${tables.map((t: any) => t.table_name).join(', ')}`);
      } catch (tablesError) {
        console.error('[LOCAL SEARCH] Error listing database tables:', tablesError);
      }
    }
    
    // Store all search results for later ranking
    const allResults: any[] = [];
    
    try {
      console.log('[LOCAL SEARCH] Using direct schema adapter search');
      
      // Process query to optimize search
      const processedQuery = preprocessQuery(normalizedQuery);
      if (processedQuery !== normalizedQuery) {
        console.log(`[LOCAL SEARCH] Preprocessed query for better matching: "${processedQuery.substring(0, 50)}..."`);
      }
      
      // Try full-text search first - highest priority
      try {
        // Check if content_tsv column exists using SQL metadata
        const columnCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'KnowledgeChunk' 
            AND column_name = 'content_tsv'
          ) as has_column;
        `);
        
        const hasTsvColumn = columnCheck[0]?.has_column === true;
        
        if (hasTsvColumn) {
          console.log(`[LOCAL SEARCH] Using PostgreSQL full-text search with processed query`);
          
          // Create a proper tsquery from the processed query
          // Replace spaces with & for AND logic in full-text search
          const searchTerms = processedQuery.split(/\s+/).filter(term => term.length > 1);
          const tsQueryString = searchTerms.join(' & ');
          
          if (tsQueryString) {
            // Use full-text search with proper ranking
            // Build the SQL query with optional document filtering
            let query = sql`
              SELECT 
                kc.id,
                kc."documentId", 
                kd.title,
                kc.content,
                kd."sourceUrl" as url,
                ts_rank(kc.content_tsv, to_tsquery('english', ${tsQueryString})) as score
              FROM "KnowledgeChunk" kc
              JOIN "KnowledgeDocument" kd ON kc."documentId" = kd.id
              WHERE kd."userId" = ${userId}
              AND kc.content_tsv @@ to_tsquery('english', ${tsQueryString})
            `;
            
            // Add document filtering if provided
            if (documentIds && documentIds.length > 0) {
              query = sql`${query} AND kd.id IN (${sql.join(documentIds, sql`, `)})`;  
            }
            
            // Add ordering and limit
            query = sql`${query} ORDER BY score DESC LIMIT ${limit}`;
            
            const results = await db.execute(query);
              
            if (results.length > 0) {
              console.log(`[LOCAL SEARCH] Found ${results.length} results using full-text search`);
              const ftResults = results.map((chunk: any) => ({
                id: chunk.id,
                documentId: chunk.documentid,
                title: chunk.title || 'Untitled Document',
                content: chunk.content,
                url: chunk.url || '',
                score: parseFloat(chunk.score) || 0.9, // Use actual rank with high base priority
                matchType: 'full-text'
              }));
              
              // Add to all results
              allResults.push(...ftResults);
            }
          }
        }
      } catch (ftError) {
        console.error('[LOCAL SEARCH] Full-text search error:', ftError);
      }
      
      // Try exact match search - very high priority
      try {
        // Perform exact match search (case insensitive)
        let exactMatchQuery = db
          .select({
            id: knowledgeChunk.id,
            documentId: knowledgeChunk.documentId,
            title: knowledgeDocument.title,
            content: knowledgeChunk.content,
            url: knowledgeDocument.sourceUrl,
          })
          .from(knowledgeChunk)
          .innerJoin(
            knowledgeDocument,
            eq(knowledgeChunk.documentId, knowledgeDocument.id)
          )
          .where(
            and(
              eq(knowledgeDocument.userId, userId),
              sql`LOWER(${knowledgeChunk.content}) LIKE LOWER(${`%${processedQuery}%`})`
            )
          );
          
        // Add document filtering if provided
        if (documentIds && documentIds.length > 0) {
          exactMatchQuery = exactMatchQuery.where(
            inArray(knowledgeDocument.id, documentIds)
          );
        }
        
        // Limit but don't order by date (we'll rank manually)
        const exactMatches = await exactMatchQuery.limit(limit * 2); // Fetch more for better ranking
        
        if (exactMatches.length > 0) {
          console.log(`[LOCAL SEARCH] Found ${exactMatches.length} results with exact match`);
          
          // Score exact matches by how well they match the content
          const exactResults = exactMatches.map((chunk: any) => {
            // Calculate how central the match is in the content
            const content = chunk.content.toLowerCase();
            const searchTerm = processedQuery.toLowerCase();
            const matchPosition = content.indexOf(searchTerm);
            
            // If the match is at the beginning, it's likely more relevant
            const positionScore = matchPosition > -1 ? 
              Math.max(0.1, 1 - (matchPosition / content.length)) : 0;
              
            // If content has a higher density of search terms, it's more relevant
            const termMatches = (content.match(new RegExp(searchTerm, 'gi')) || []).length;
            const densityScore = Math.min(0.3, termMatches * 0.05);
            
            return {
              id: chunk.id,
              documentId: chunk.documentId,
              title: chunk.title || 'Untitled Document',
              content: chunk.content,
              url: chunk.url || '',
              score: 0.85 + positionScore + densityScore, // Base score higher than text search
              matchType: 'exact'
            };
          });
          
          // Add to all results
          allResults.push(...exactResults);
        }
      } catch (exactError) {
        console.error('[LOCAL SEARCH] Exact match search error:', exactError);
      }
      
      // Try with the processed query - medium priority
      try {
        let processedResultsQuery = db
          .select({
            id: knowledgeChunk.id,
            documentId: knowledgeChunk.documentId,
            title: knowledgeDocument.title,
            content: knowledgeChunk.content,
            url: knowledgeDocument.sourceUrl,
          })
          .from(knowledgeChunk)
          .innerJoin(
            knowledgeDocument,
            eq(knowledgeChunk.documentId, knowledgeDocument.id)
          )
          .where(
            and(
              eq(knowledgeDocument.userId, userId),
              sql`${knowledgeChunk.content} ILIKE ${`%${processedQuery}%`}`
            )
          );
          
        // Add document filtering if provided
        if (documentIds && documentIds.length > 0) {
          processedResultsQuery = processedResultsQuery.where(
            inArray(knowledgeDocument.id, documentIds)
          );
        }
        
        // Complete the query with ordering and limit
        const processedResults = await processedResultsQuery
          .orderBy(desc(knowledgeDocument.createdAt))
          .limit(limit * 2); // Fetch more for better ranking
        
        if (processedResults.length > 0) {
          console.log(`[LOCAL SEARCH] Found ${processedResults.length} results using processed query text search`);
          const pResults = processedResults.map((chunk: any) => ({
            id: chunk.id,
            documentId: chunk.documentId,
            title: chunk.title || 'Untitled Document',
            content: chunk.content,
            url: chunk.url || '',
            score: 0.6, // Medium priority score
            matchType: 'processed'
          }));
          
          // Add to all results
          allResults.push(...pResults);
        }
      } catch (processedError) {
        console.error('[LOCAL SEARCH] Processed query search error:', processedError);
      }
      
      // If original query is different from processed, try the original normalized query - lower priority
      if (normalizedQuery !== processedQuery) {
        try {
          let normalizedResultsQuery = db
            .select({
              id: knowledgeChunk.id,
              documentId: knowledgeChunk.documentId,
              title: knowledgeDocument.title,
              content: knowledgeChunk.content,
              url: knowledgeDocument.sourceUrl,
            })
            .from(knowledgeChunk)
            .innerJoin(
              knowledgeDocument,
              eq(knowledgeChunk.documentId, knowledgeDocument.id)
            )
            .where(
              and(
                eq(knowledgeDocument.userId, userId),
                sql`${knowledgeChunk.content} ILIKE ${`%${normalizedQuery}%`}`
              )
            );
            
          // Add document filtering if provided
          if (documentIds && documentIds.length > 0) {
            normalizedResultsQuery = normalizedResultsQuery.where(
              inArray(knowledgeDocument.id, documentIds)
            );
          }
          
          // Complete the query with ordering and limit
          const normalizedResults = await normalizedResultsQuery
            .orderBy(desc(knowledgeDocument.createdAt))
            .limit(limit * 2);

          if (normalizedResults.length > 0) {
            console.log(`[LOCAL SEARCH] Found ${normalizedResults.length} results using normalized text search`);
            const nResults = normalizedResults.map((chunk: any) => ({
              id: chunk.id,
              documentId: chunk.documentId,
              title: chunk.title || 'Untitled Document',
              content: chunk.content,
              url: chunk.url || '',
              score: 0.5, // Lower priority score
              matchType: 'normalized'
            }));
            
            // Add to all results
            allResults.push(...nResults);
          }
        } catch (normalizedError) {
          console.error('[LOCAL SEARCH] Normalized query search error:', normalizedError);
        }
      }
      
      // Get recent documents as a fallback, lowest priority
      try {
        if (allResults.length < limit) {
          console.log('[LOCAL SEARCH] Adding recent documents as fallback');
          let recentResultsQuery = db
            .select({
              id: knowledgeChunk.id,
              documentId: knowledgeChunk.documentId,
              title: knowledgeDocument.title,
              content: knowledgeChunk.content,
              url: knowledgeDocument.sourceUrl,
            })
            .from(knowledgeChunk)
            .innerJoin(
              knowledgeDocument,
              eq(knowledgeChunk.documentId, knowledgeDocument.id)
            )
            .where(eq(knowledgeDocument.userId, userId));
            
          // Add document filtering if provided
          if (documentIds && documentIds.length > 0) {
            recentResultsQuery = recentResultsQuery.where(
              inArray(knowledgeDocument.id, documentIds)
            );
          }
          
          // Complete the query with ordering and limit
          const recentResults = await recentResultsQuery
            .orderBy(desc(knowledgeDocument.createdAt))
            .limit(limit * 2);

          console.log(`[LOCAL SEARCH] Found ${recentResults.length} recent documents`);
          
          // Check which documents aren't already in results
          const existingIds = new Set(allResults.map(item => item.id));
          const newRecents = recentResults.filter(item => !existingIds.has(item.id));
          
          const rResults = newRecents.map((chunk: any) => ({
            id: chunk.id,
            documentId: chunk.documentId,
            title: chunk.title || 'Untitled Document',
            content: chunk.content,
            url: chunk.url || '',
            score: 0.1, // Lowest priority score 
            matchType: 'recent'
          }));
          
          // Add to all results
          allResults.push(...rResults);
        }
      } catch (recentError) {
        console.error('[LOCAL SEARCH] Recent documents search error:', recentError);
      }
      
      // If we have results, sort by score, remove duplicates, and return top 'limit' results
      if (allResults.length > 0) {
        console.log(`[LOCAL SEARCH] Total combined results before deduplication: ${allResults.length}`);
        
        // Remove duplicates by preferring higher scored versions of the same chunk
        const uniqueResults = allResults.reduce((acc, current) => {
          const existingIndex = acc.findIndex((item: any) => item.id === current.id);
          if (existingIndex === -1) {
            // Item doesn't exist, add it
            acc.push(current);
          } else if (current.score > acc[existingIndex].score) {
            // Replace with higher scored version
            acc[existingIndex] = current;
          }
          return acc;
        }, [] as typeof allResults);
        
        // Sort by score (highest first)
        uniqueResults.sort((a, b) => b.score - a.score);
        
        // Take only the top 'limit' results
        const topResults = uniqueResults.slice(0, limit);
        
        console.log(`[LOCAL SEARCH] Returning ${topResults.length} ranked results with types: ${topResults.map(r => r.matchType).join(', ')}`);
        
        return topResults;
      }
      
      // If no results found from any method
      console.log('[LOCAL SEARCH] No results found using any search method');
      return [];
    } catch (directError) {
      console.error('[LOCAL SEARCH] Direct search error:', directError);
    }
    
    // Last resort - use local files if nothing else works
    console.log('[LOCAL SEARCH] Using fallback local file search');
    const localFallbackResults = getFallbackResults(query, userId, limit);
    
    if (localFallbackResults.length > 0) {
      console.log(`[LOCAL SEARCH] Found ${localFallbackResults.length} results using local fallback search`);
      return localFallbackResults;
    }
    
    // If all else fails, return empty array
    console.log('[LOCAL SEARCH] No results found');
    return [];
  } catch (error) {
    console.error('[LOCAL SEARCH] Error in knowledge search:', error);
    // Return empty array instead of throwing to improve resilience
    return [];
  }
}