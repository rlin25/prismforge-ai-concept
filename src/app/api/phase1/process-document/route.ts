// API Route for Phase 1 Document Processing
// PrismForge AI - Professional M&A Validation Platform

import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for pdf-parse compatibility
export const runtime = 'nodejs';
import { Phase1DocumentProcessor } from '@/lib/document-processor';
import { supabase } from '@/lib/supabase';
import type { ProcessedDocument } from '@/types/phase1.types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get session and user information
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('user_id, organization_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 404 }
      );
    }

    // Initialize document processor
    const processor = new Phase1DocumentProcessor();

    // Process the document
    const processedDocument = await processor.processDocument(
      file,
      sessionId,
      session.user_id,
      session.organization_id
    );

    return NextResponse.json(processedDocument);

  } catch (error) {
    console.error('Document processing API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Document processing failed',
        message: errorMessage,
        code: 'PROCESSING_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get processed documents for the session
    const { data: documents, error } = await supabase
      .from('document_processing')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching processed documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Transform database records to ProcessedDocument interface
    const processedDocuments: ProcessedDocument[] = documents.map(doc => ({
      id: doc.id,
      fileName: doc.file_name,
      fileType: doc.file_type,
      fileSizeBytes: doc.file_size_bytes,
      processingStatus: doc.processing_status,
      extractedData: doc.extracted_data || {},
      documentSummary: doc.document_summary,
      keyInsights: doc.key_insights || [],
      classification: doc.classification,
      tokenUsage: doc.token_usage || 0,
      processingCostCents: 0, // Always $0 for Phase 1
      organizationId: doc.organization_id,
      uploadedBy: doc.uploaded_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    }));

    return NextResponse.json(processedDocuments);

  } catch (error) {
    console.error('Error fetching processed documents:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Delete the document processing record
    const { error } = await supabase
      .from('document_processing')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting document:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}