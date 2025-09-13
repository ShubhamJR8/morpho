import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Download, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CheckCircle,
  Share2,
  RotateCcw
} from 'lucide-react';

interface ResultPageState {
  resultUrl: string;
  processingTime: number;
  template: {
    id: string;
    title: string;
    description?: string;
    category?: string;
  };
}

export const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultPageState;

  if (!state?.resultUrl) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No result found</h3>
        <p className="text-muted-foreground mb-4">Please go back and try editing an image.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(state.resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-edited-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Style Editor Result',
          text: `Check out my AI-edited image using the ${state.template.title} style!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold">Transformation Complete!</h1>
        </div>
        <p className="text-muted-foreground">
          Your image has been successfully transformed with the {state.template.title} style.
        </p>
      </motion.div>

      {/* Result Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Transformed Image</span>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Processed in {formatProcessingTime(state.processingTime)}</span>
              </div>
            </CardTitle>
            <CardDescription>
              Style: {state.template.title}
              {state.template.category && ` • ${state.template.category}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative group">
              <img
                src={state.resultUrl}
                alt="AI Edited Result"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
      >
        <Button onClick={handleDownload} size="lg" className="w-full sm:w-auto">
          <Download className="mr-2 h-5 w-5" />
          Download Image
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate(`/edit/${state.template.id}`)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Try Another Image
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          size="lg"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Gallery
        </Button>
      </motion.div>

      {/* Template Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              About This Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Style:</span> {state.template.title}
              </div>
              {state.template.description && (
                <div>
                  <span className="font-medium">Description:</span> {state.template.description}
                </div>
              )}
              {state.template.category && (
                <div>
                  <span className="font-medium">Category:</span> {state.template.category}
                </div>
              )}
              <div>
                <span className="font-medium">Processing Time:</span> {formatProcessingTime(state.processingTime)}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
