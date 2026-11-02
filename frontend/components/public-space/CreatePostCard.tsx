'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import { PostingAllowance, Post, PostPrivacy, MediaType } from '../../types';
import {
  Image as ImageIcon,
  Video,
  Globe,
  Users,
  Lock,
  Send,
  X,
  Plus,
  AlertCircle,
  Hash,
  AtSign,
  UserPlus,
} from 'lucide-react';

interface CreatePostCardProps {
  allowance: PostingAllowance | null;
  onPostCreated: (post: Post, newAllowance: PostingAllowance) => void;
  currentUserAvatar?: string;
  currentUserName?: string;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  allowance,
  onPostCreated,
  currentUserAvatar,
  currentUserName,
}) => {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');
  const [mediaType, setMediaType] = useState<MediaType>('none');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canPost = allowance?.allowed ?? false;

  // Extract preview tags & mentions
  const hashtags = Array.from(new Set(content.match(/#([a-zA-Z0-9_]+)/g) || []));
  const mentions = Array.from(new Set(content.match(/@([a-zA-Z0-9_]+)/g) || []));

  const handleAddMediaUrl = () => {
    if (!newMediaUrl.trim()) return;
    try {
      new URL(newMediaUrl.trim());
    } catch {
      setErrorMessage('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    if (mediaType === 'video' && mediaUrls.length >= 1) {
      setErrorMessage('Only 1 video can be attached per post');
      return;
    }
    if (mediaType === 'image' && mediaUrls.length >= 4) {
      setErrorMessage('Maximum 4 images allowed per post');
      return;
    }

    setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
    setNewMediaUrl('');
    setErrorMessage('');
  };

  const handleRemoveMediaUrl = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updated);
    if (updated.length === 0) {
      setMediaType('none');
      setShowMediaInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!canPost) {
      setErrorMessage(
        allowance?.message || 'Posting is restricted based on your accepted friends count.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.createPost({
        content: content.trim(),
        privacy,
        mediaType: mediaUrls.length > 0 ? mediaType : 'none',
        mediaUrls,
      });

      if (res.success && res.data) {
        setContent('');
        setMediaUrls([]);
        setMediaType('none');
        setShowMediaInput(false);
        onPostCreated(res.data.post, res.data.allowance);
      } else {
        setErrorMessage(res.message || 'Failed to create post. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while publishing your post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden">
            {currentUserAvatar ? (
              <img src={currentUserAvatar} alt={currentUserName || 'User'} className="w-full h-full object-cover" />
            ) : (
              (currentUserName || 'U')[0].toUpperCase()
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">{currentUserName || 'Create a post'}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Public Space</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {privacy === 'public' && <Globe className="w-3 h-3 text-slate-400" />}
                {privacy === 'friends' && <Users className="w-3 h-3 text-slate-400" />}
                {privacy === 'private' && <Lock className="w-3 h-3 text-slate-400" />}
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
                  className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none cursor-pointer hover:text-primary-600"
                >
                  <option value="public">Anyone (Public)</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Allowance Quick Badge */}
        {allowance && (
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              allowance.allowed
                ? 'bg-slate-100 text-slate-700'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {allowance.isUnlimited
              ? 'Unlimited posts'
              : `${allowance.remaining} post${allowance.remaining === 1 ? '' : 's'} left`}
          </span>
        )}
      </div>

      {/* Zero Friends Restriction Banner */}
      {allowance && !allowance.allowed && allowance.acceptedFriends === 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Posting is currently locked</p>
            <p className="mt-0.5 text-amber-700">
              Under community guidelines, you must have at least 1 accepted friend to create public posts.
            </p>
            <div className="mt-2.5">
              <Link
                href="/public-space/discovery"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" /> Explore & Connect with Peers
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Textarea Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!canPost || isSubmitting}
            placeholder={
              !canPost
                ? 'Posting locked. Connect with friends to unlock sharing.'
                : 'What career insight, internship milestone, or question do you want to share with the community? Use #tags or @mentions...'
            }
            rows={3}
            maxLength={3000}
            className="w-full resize-none p-3.5 text-sm text-navy-900 bg-slate-50/70 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <div className="text-[11px] text-right text-slate-400 pr-1 mt-0.5">
            {content.length}/3000
          </div>
        </div>

        {/* Live Detected Tags & Mentions */}
        {(hashtags.length > 0 || mentions.length > 0) && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md font-medium"
              >
                <Hash className="w-3 h-3" />
                {tag.slice(1)}
              </span>
            ))}
            {mentions.map((user) => (
              <span
                key={user}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium"
              >
                <AtSign className="w-3 h-3" />
                {user.slice(1)}
              </span>
            ))}
          </div>
        )}

        {/* Media Attachments Preview */}
        {mediaUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Attached Media ({mediaUrls.length}):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                  {mediaType === 'image' ? (
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-xs">
                      <Video className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMediaUrl(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media URL Input Box */}
        {showMediaInput && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Attach {mediaType === 'image' ? 'Image URL' : 'Video URL'}
              </span>
              <button
                type="button"
                onClick={() => setShowMediaInput(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder={
                  mediaType === 'image'
                    ? 'https://images.unsplash.com/... or image link'
                    : 'https://example.com/video.mp4'
                }
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Add Photo */}
            <button
              type="button"
              disabled={!canPost}
              onClick={() => {
                setMediaType('image');
                setShowMediaInput(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-100 transition disabled:opacity-40"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            {/* Add Video */}
            <button
              type="button"
              disabled={!canPost}
              onClick={() => {
                setMediaType('video');
                setShowMediaInput(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-100 transition disabled:opacity-40"
            >
              <Video className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Video</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!canPost || !content.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Publishing...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
