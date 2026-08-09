import React, { useState, useRef } from 'react';
import { Send, Smile, Camera, Image as ImageIcon, Paperclip, X, RefreshCw } from 'lucide-react';
import { uploadFileApi } from '../services/api';
import { CameraModal } from './CameraModal';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '💯', '👋'];

export const MessageInput = ({ onSendMessage, onInputChange, disabled = false }) => {
  const [content, setContent] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState(null); // { url, type, name }
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadFileApi(file);
      if (res && res.data) {
        setMediaAttachment({
          url: res.data.fileUrl,
          type: res.data.mediaType,
          name: file.name || 'photo.jpg',
        });
      }
    } catch (err) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCameraCapture = (file) => {
    handleFileUpload(file);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!content.trim() && !mediaAttachment) || disabled || uploading) return;

    onSendMessage({
      content: content.trim(),
      mediaUrl: mediaAttachment ? mediaAttachment.url : null,
      mediaType: mediaAttachment ? mediaAttachment.type : null,
    });

    setContent('');
    setMediaAttachment(null);
    setShowEmojis(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    if (onInputChange) onInputChange();
  };

  const handleAddEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    if (onInputChange) onInputChange();
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div
      style={{
        padding: '14px 24px',
        backgroundColor: 'var(--bg-card-solid)',
        borderTop: '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />

      {/* Quick Emoji Picker Popover */}
      {showEmojis && (
        <div
          className="animate-fade-in glass-panel"
          style={{
            position: 'absolute',
            bottom: '75px',
            left: '24px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: '8px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 20,
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Media Preview Attachment Bar */}
      {uploading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <RefreshCw size={16} className="spin" />
          <span>Uploading photo...</span>
        </div>
      ) : mediaAttachment ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
            padding: '6px 12px 6px 6px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <img
            src={`${API_URL}${mediaAttachment.url}`}
            alt="Attachment preview"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              objectFit: 'cover',
            }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '600' }}>
            Photo attached
          </span>
          <button
            type="button"
            onClick={() => setMediaAttachment(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '6px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Emoji Icon Button */}
        <button
          type="button"
          onClick={() => setShowEmojis((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: showEmojis ? 'var(--primary)' : 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Add emoji"
        >
          <Smile size={20} />
        </button>

        {/* Gallery / File Picker Icon Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Attach photo or file"
        >
          <ImageIcon size={20} />
        </button>

        {/* Instant Camera Icon Button */}
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Capture photo from camera"
        >
          <Camera size={20} />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Disconnected...' : 'Type a message or attach a photo...'}
          disabled={disabled}
          className="glass-input"
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.925rem',
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!content.trim() && !mediaAttachment) || uploading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: disabled || (!content.trim() && !mediaAttachment) || uploading ? 'rgba(99, 102, 241, 0.25)' : 'var(--aurora-gradient)',
            color: '#FFFFFF',
            border: 'none',
            cursor: disabled || (!content.trim() && !mediaAttachment) || uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: disabled || (!content.trim() && !mediaAttachment) || uploading ? 'none' : 'var(--shadow-aurora)',
          }}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
