
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
import { useToast } from "@/hooks/use-toast";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
  unconfiguredHostname: string | null;
  isModalOpen: boolean;
}

// This component might still be useful for other next/image instances in your app,
// but for LinkBlock thumbnails, we are now bypassing next/image.
// If it's ONLY used for LinkBlock thumbnails, it can be removed.
// For now, I'm keeping it in case you use next/image elsewhere.

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

  static getDerivedStateFromError(error: Error): Partial<State> {
    const hostnameMatch = error.message.match(/hostname "([^"]+)" is not configured/);
    if (hostnameMatch && hostnameMatch[1]) {
      return {
        hasError: true,
        errorMessage: error.message,
        unconfiguredHostname: hostnameMatch[1],
        isModalOpen: false,
      };
    }
    return {
      hasError: true,
      errorMessage: error.message,
      unconfiguredHostname: null,
      isModalOpen: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ImageErrorBoundary caught an error:", error, errorInfo);
  }

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false, hasError: false, unconfiguredHostname: null, errorMessage: null });

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
          {/* <p className="text-xs text-muted-foreground/70 text-center mt-1">{this.state.errorMessage}</p> */}
        </div>
      );
    }

    return this.props.children;
  }
}

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
        Image from '{hostname}' needs config.
      </p>
      <Button variant="destructive" size="sm" onClick={openModal} className="text-xs h-7 px-2">
        Fix Error
      </Button>
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
              Resolve Image Loading Error
            </DialogTitle>
            <DialogDescription className="pt-2">
              The image from hostname <strong className="text-foreground">{hostname}</strong> could not be displayed by <code>next/image</code> because it's not registered in <code>next.config.js</code>.
              <br /><br />
              To fix this, please copy the hostname below and provide it to your AI assistant to add to the configuration.
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
