'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessedDocument } from '@/types/phase1.types';

interface FileUploadProps {
  onFileProcessed: (document: ProcessedDocument) => void;
  onFileRemoved: (documentId: string) => void;
  processedDocuments: ProcessedDocument[];
  sessionId: string;
  disabled?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export function FileUpload({
  onFileProcessed,
  onFileRemoved,
  processedDocuments,
  sessionId,
  disabled = false,
  className,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = ['pdf', 'xlsx', 'xls', 'csv'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-success-green-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-error-red-600" />;
      case 'csv':
        return <File className="w-5 h-5 text-prism-blue-600" />;
      default:
        return <File className="w-5 h-5 text-text-tertiary" />;
    }
  };

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !supportedTypes.includes(extension)) {
      return `Unsupported file type. Please upload: ${supportedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }
    
    // Check if file already exists
    const existingFile = processedDocuments.find(doc => doc.fileName === file.name);
    if (existingFile) {
      return `File "${file.name}" has already been uploaded`;
    }
    
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const fileId = `${file.name}_${Date.now()}`;
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadingFiles(prev => new Map(prev.set(fileId, {
        file,
        progress: 0,
        status: 'failed',
        error: validationError,
      })));
      return;
    }

    // Initialize upload state
    setUploadingFiles(prev => new Map(prev.set(fileId, {
      file,
      progress: 0,
      status: 'uploading',
    })));

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 50; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadingFiles(prev => {
          const current = prev.get(fileId);
          if (current) {
            return new Map(prev.set(fileId, { ...current, progress }));
          }
          return prev;
        });
      }

      // Switch to processing state
      setUploadingFiles(prev => {
        const current = prev.get(fileId);
        if (current) {
          return new Map(prev.set(fileId, { ...current, status: 'processing', progress: 60 }));
        }
        return prev;
      });

      // Call document processing API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/phase1/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed');
      }

      const processedDocument: ProcessedDocument = await response.json();

      // Complete upload
      setUploadingFiles(prev => {
        const current = prev.get(fileId);
        if (current) {
          return new Map(prev.set(fileId, { ...current, status: 'completed', progress: 100 }));
        }
        return prev;
      });

      // Notify parent component
      onFileProcessed(processedDocument);

      // Remove from uploading files after a short delay
      setTimeout(() => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 2000);

    } catch (error) {
      console.error('File processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setUploadingFiles(prev => {
        const current = prev.get(fileId);
        if (current) {
          return new Map(prev.set(fileId, { 
            ...current, 
            status: 'failed', 
            error: errorMessage,
            progress: 0,
          }));
        }
        return prev;
      });
    }
  }, [sessionId, onFileProcessed, processedDocuments]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    if (disabled) return;
    
    Array.from(files).forEach(file => {
      processFile(file);
    });
  }, [processFile, disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  }, [handleFiles]);

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    onFileRemoved(documentId);
  };

  const retryUpload = (fileId: string) => {
    const uploadingFile = uploadingFiles.get(fileId);
    if (uploadingFile) {
      processFile(uploadingFile.file);
    }
  };

  const cancelUpload = (fileId: string) => {
    setUploadingFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  const getStatusBadge = (status: ProcessedDocument['processingStatus']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success-green-100 text-success-green-800">Processed</Badge>;
      case 'processing':
        return <Badge className="bg-prism-blue-100 text-prism-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-error-red-100 text-error-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className={className}>
      {/* Upload Zone */}
      <Card className={cn(
        "border-2 border-dashed transition-colors duration-200",
        dragActive ? "border-primary bg-primary/5" : "border-border",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-8">
          <div
            className={cn(
              "text-center space-y-4",
              !disabled && "cursor-pointer"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            <div className="mx-auto w-12 h-12 bg-surface rounded-lg flex items-center justify-center">
              <Upload className={cn(
                "w-6 h-6",
                dragActive ? "text-primary" : "text-text-tertiary"
              )} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-text-primary">
                {dragActive ? "Drop files here" : "Upload M&A Documents"}
              </h3>
              <p className="text-sm text-text-secondary">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-text-tertiary">
                Supports: PDF, Excel (XLSX, XLS), CSV • Max 50MB per file
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-text-primary">Processing Files</h4>
          {Array.from(uploadingFiles.entries()).map(([fileId, uploadingFile]) => (
            <Card key={fileId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(uploadingFile.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {(uploadingFile.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-prism-blue-600" />
                  )}
                  {uploadingFile.status === 'processing' && (
                    <Loader2 className="w-4 h-4 animate-spin text-prism-blue-600" />
                  )}
                  {uploadingFile.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-success-green-600" />
                  )}
                  {uploadingFile.status === 'failed' && (
                    <XCircle className="w-4 h-4 text-error-red-600" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelUpload(fileId)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {uploadingFile.status !== 'failed' && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-tertiary">
                      {uploadingFile.status === 'uploading' ? 'Uploading...' : 
                       uploadingFile.status === 'processing' ? 'Processing document...' :
                       'Complete'}
                    </span>
                    <span className="text-text-tertiary">
                      {uploadingFile.progress}%
                    </span>
                  </div>
                  <Progress value={uploadingFile.progress} className="h-2" />
                </div>
              )}

              {uploadingFile.status === 'failed' && uploadingFile.error && (
                <Alert className="mt-3">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {uploadingFile.error}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-primary"
                      onClick={() => retryUpload(fileId)}
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Processed Documents */}
      {processedDocuments.length > 0 && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">
              Processed Documents ({processedDocuments.length})
            </h4>
            <Badge variant="outline" className="text-success-green-700 border-success-green-200">
              FREE Analysis
            </Badge>
          </div>
          
          {processedDocuments.map((document) => (
            <Card key={document.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(document.fileName)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {document.fileName}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {(document.fileSizeBytes / 1024 / 1024).toFixed(1)} MB • 
                      {document.keyInsights.length} insights identified
                    </p>
                    {document.documentSummary && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {document.documentSummary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(document.processingStatus)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(document.id)}
                    className="text-error-red-600 hover:text-error-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {document.keyInsights.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-text-secondary">Key Insights:</p>
                  <div className="space-y-1">
                    {document.keyInsights.slice(0, 3).map((insight, index) => (
                      <p key={index} className="text-xs text-text-tertiary">
                        • {insight}
                      </p>
                    ))}
                    {document.keyInsights.length > 3 && (
                      <p className="text-xs text-text-tertiary">
                        +{document.keyInsights.length - 3} more insights
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Phase 2 Upgrade Hint */}
      {processedDocuments.length > 0 && (
        <Alert className="mt-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Free exploration complete.</strong> For investment-grade validation with 
            Skeptic Agent + Validator Agent analysis, upgrade to professional validation ($500 per professional validation).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}