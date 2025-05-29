
"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, ImageOff, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
  unconfiguredHostname: string | null;
  isModalOpen: boolean;
}

class ImageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
      unconfiguredHostname: null,
      isModalOpen: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message,
      unconfiguredHostname: null, // Will be set in componentDidCatch
      isModalOpen: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ImageErrorBoundary caught an error:", error, errorInfo);
    const hostnameMatch = error.message.match(/hostname "([^"]+)" is not configured/);
    if (hostnameMatch && hostnameMatch[1]) {
      this.setState({ unconfiguredHostname: hostnameMatch[1] });
    }
  }

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false, hasError: false, unconfiguredHostname: null, errorMessage: null }); // Reset error state on close

  render() {
    if (this.state.unconfiguredHostname) {
      return (
        <UnconfiguredHostnameUI
          hostname={this.state.unconfiguredHostname}
          isModalOpen={this.state.isModalOpen}
          openModal={this.openModal}
          closeModal={this.closeModal}
        />
      );
    }

    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50 p-4 rounded-lg aspect-[2/1]">
          <ImageOff className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            Image could not be loaded.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component to use hooks for toast
const UnconfiguredHostnameUI = ({
  hostname,
  isModalOpen,
  openModal,
  closeModal,
}: {
  hostname: string;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}) => {
  const { toast } = useToast();

  const handleCopyHostname = async () => {
    try {
      await navigator.clipboard.writeText(hostname);
      toast({
        title: "Hostname Copied!",
        description: `${hostname} copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy hostname.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-destructive/10 p-2 rounded-lg aspect-[2/1] border border-destructive/30">
      <AlertTriangle className="w-8 h-8 text-destructive mb-1" />
      <p className="text-xs text-destructive/80 text-center mb-2">
        Image from '{hostname}' not configured.
      </p>
      <Button variant="destructive" size="sm" onClick={openModal} className="text-xs h-7 px-2">
        Details
      </Button>
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
              Unconfigured Image Source
            </DialogTitle>
            <DialogDescription className="pt-2">
              The image from hostname <strong className="text-foreground">{hostname}</strong> could not be displayed because it is not yet registered in the application's image configuration.
              <br /><br />
              To resolve this, please copy the hostname and provide it to the AI developer to add to the configuration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button onClick={handleCopyHostname} className="gap-2">
              <Copy className="w-4 h-4" /> Copy Hostname
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageErrorBoundary;
