'use client';

import React from 'react';
import Link from 'next/link';
import { X, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface ProfileCompletionBannerProps {
  className?: string;
}

export default function ProfileCompletionBanner({ className }: ProfileCompletionBannerProps) {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check if user is authenticated
  if (!user) return null;

  // Check if banner was dismissed
  if (isDismissed) return null;

  // Check if profile is complete
  const isProfileComplete = user.customMetadata?.firstName && 
                           user.customMetadata?.lastName && 
                           user.customMetadata?.bio;

  // Don't show if profile is already complete
  if (isProfileComplete) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className={cn(
      "relative w-full mb-8 animate-in slide-in-from-top-4 duration-500",
      className
    )}>
      {/* Futuristic background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
      
      <div className="glass-card border-blue-500/20 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Icon */}
            <div className="relative">
              <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center border-blue-400/30">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                Complete Your Profile
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                You need to complete your profile before you can submit to bounties. Please add your bio, skills, experience, and contact information to get started.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <Link href="/profile/edit">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
                size="sm"
              >
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      </div>
    </div>
  );
}