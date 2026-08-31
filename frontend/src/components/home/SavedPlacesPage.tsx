import React, { useState } from "react";
import { motion } from "motion/react";
import { buttonTap, cardHover, cardTap, chipTap, staggerContainer, staggerItem } from "../../lib/motion";
import {
  Bookmark,
  MapPin,
  Compass,
  ArrowLeft,
  Trash2,
  Heart,
  Sparkles,
  Share2,
  Download,
  Upload,
  Calendar,
  Check,
  FileText,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useSavedPlaces, type SavedPlace } from "../../store/useSavedPlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import {
  getPlaceImageUrl,
  getPlaceRegion,
} from "../../utils/imageService";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";
import {
  createShareableSavedPlacesUrl,
  exportSavedPlacesAsJson,
  exportSavedPlacesAsMarkdown,
  downloadTextFile,
  importSavedPlacesFromJson,
  generateSavedPlacesSummary,
} from "../../utils/savedPlacesExport";

interface SavedPlacesPageProps {
  onBackToDiscover: () => void;
  onSelectPlace?: (place: SelectedPlaceInfo) => void;
  onPlanWithSaved: (places: SavedPlace[]) => void;
  onPlanWithSinglePlace?: (place: SelectedPlaceInfo) => void;
}

export const SavedPlacesPage: React.FC<SavedPlacesPageProps> = ({
  onBackToDiscover,
  onSelectPlace,
  onPlanWithSaved,
  onPlanWithSinglePlace,
}) => {
  const {
    savedPlaces,
    removePlace,
    clearAllSaved,
    importPlaces,
  } = useSavedPlaces();

  const [activeTab, setActiveTab] = useState<"places" | "export">("places");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCopyShareLink = () => {
    const url = createShareableSavedPlacesUrl(savedPlaces);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopySummary = () => {
    const summary = generateSavedPlacesSummary(savedPlaces);
    navigator.clipboard.writeText(summary).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  const handleDownloadJson = () => {
    const json = exportSavedPlacesAsJson(savedPlaces);
    const filename = `o-travelz-saved-places-${new Date().toISOString().slice(0, 10)}.json`;
    downloadTextFile(json, filename, "application/json");
  };

  const handleDownloadMarkdown = () => {
    const md = exportSavedPlacesAsMarkdown(savedPlaces);
    const filename = `o-travelz-saved-places-${new Date().toISOString().slice(0, 10)}.md`;
    downloadTextFile(md, filename, "text/markdown");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = importSavedPlacesFromJson(content);
        if (imported.length > 0) {
          importPlaces(imported);
          setImportStatus(`Successfully imported ${imported.length} places!`);
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus("Could not import: Invalid or empty file.");
          setTimeout(() => setImportStatus(null), 3000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div data-testid="saved-places-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#12161E]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="saved-places-back-btn"
              onClick={onBackToDiscover}
              className="p-2 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#12161E] transition-colors cursor-pointer"
              aria-label="Back to Discover"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[#A84825]">
                <Bookmark size={18} />
              </span>
              <h1
                data-testid="saved-places-title"
                className="text-2xl sm:text-3xl font-serif font-bold text-[#12161E] tracking-tight"
              >
                Saved Places & Wishlist
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#70798B] pl-11">
            Review your saved destinations across Odisha, export your wishlist, or turn them into a custom trip plan.
          </p>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F2EEE7] p-1 rounded-xl border border-[#E5DFD5]">
          <button
            type="button"
            data-testid="saved-tab-places"
            onClick={() => setActiveTab("places")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "places"
                ? "bg-[#FFFFFF] text-[#12161E] shadow-xs"
                : "text-[#70798B] hover:text-[#12161E]"
            }`}
          >
            Saved Places ({savedPlaces.length})
          </button>
          <button
            type="button"
            data-testid="saved-tab-export"
            onClick={() => setActiveTab("export")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "export"
                ? "bg-[#FFFFFF] text-[#12161E] shadow-xs"
                : "text-[#70798B] hover:text-[#12161E]"
            }`}
          >
            Share & Export
          </button>
        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      {activeTab === "export" ? (
        <div data-testid="saved-export-panel" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Share Link Card */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#B87B22] flex items-center justify-center">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#12161E]">Shareable Wishlist Link</h3>
                  <p className="text-xs text-[#70798B]">
                    Generate a portable web link containing your {savedPlaces.length} saved places.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  data-testid="saved-share-link-cta"
                  onClick={handleCopyShareLink}
                  disabled={savedPlaces.length === 0}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    copiedLink
                      ? "bg-[#2F523E] text-white"
                      : "bg-[#B87B22] hover:bg-[#A0691B] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Shareable Link"}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Text Card */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#1B5E6B] flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#12161E]">Formatted Summary</h3>
                  <p className="text-xs text-[#70798B]">
                    Copy a clean, readable text overview for messaging apps or notes.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  data-testid="saved-copy-summary-cta"
                  onClick={handleCopySummary}
                  disabled={savedPlaces.length === 0}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border shadow-xs ${
                    copiedSummary
                      ? "bg-[#2F523E] text-white border-[#2F523E]"
                      : "bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] border-[#E5DFD5] disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {copiedSummary ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSummary ? "Summary Copied!" : "Copy Formatted Text"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Import Section */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-4">
            <h3 className="font-serif font-bold text-base text-[#12161E]">Backup & File Downloads</h3>
            <p className="text-xs text-[#70798B] leading-relaxed">
              Save your wishlist as portable JSON for backups, or as structured Markdown for travel journals and obsidian/notion.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="saved-download-json-cta"
                onClick={handleDownloadJson}
                disabled={savedPlaces.length === 0}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download size={14} className="text-[#B87B22]" />
                <span>Download JSON</span>
              </button>

              <button
                type="button"
                data-testid="saved-download-markdown-cta"
                onClick={handleDownloadMarkdown}
                disabled={savedPlaces.length === 0}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download size={14} className="text-[#1B5E6B]" />
                <span>Download Markdown (.md)</span>
              </button>

              <label className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer">
                <Upload size={14} className="text-[#A84825]" />
                <span>Import from JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs font-medium text-[#12161E]">
                {importStatus}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div data-testid="saved-places-list" className="space-y-6">
          {savedPlaces.length === 0 ? (
            <div
              data-testid="saved-places-empty"
              className="text-center py-16 px-4 rounded-3xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-4 shadow-xs"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#A84825] flex items-center justify-center font-bold text-2xl">
                <Heart size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#12161E]">Nothing saved yet</h3>
                <p className="text-xs sm:text-sm text-[#70798B] max-w-md mx-auto leading-relaxed">
                  When discovering places in Odisha, tap the save icon to keep them here for quick planning.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToDiscover}
                className="px-5 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Explore Odisha Destinations</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#70798B] font-medium">
                <span>
                  Showing <span className="font-bold text-[#12161E]">{savedPlaces.length}</span> saved{" "}
                  {savedPlaces.length === 1 ? "place" : "places"}.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-testid="saved-plan-all-cta"
                    onClick={() => onPlanWithSaved(savedPlaces)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Compass size={13} />
                    <span>Plan Trip with All Saved</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSaved}
                    className="text-[#A84825] hover:underline cursor-pointer font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPlaces.map((item) => {
                  const imageUrl = resolvePlaceImageUrl({ name: item.name, category: item.category }, "card");
                  return (
                    <div
                      key={item.id || item.name}
                      data-testid={`saved-item-${item.id || item.name}`}
                      className="group rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#D1C8BA] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden text-[#12161E]"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative h-36 w-full bg-[#F2EEE7] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlaceImageUrl(item.name, item.category);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <button
                          type="button"
                          data-testid={`remove-saved-${item.id || item.name}`}
                          onClick={() => removePlace(item.id || item.name)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 text-[#12161E] hover:bg-white transition-colors cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="absolute bottom-2 left-3 right-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 font-mono">
                            {item.category}
                          </span>
                          <h3
                            className="font-serif font-bold text-sm text-white hover:text-[#B87B22] transition-colors cursor-pointer truncate"
                            onClick={() =>
                              onSelectPlace?.({
                                id: item.id,
                                name: item.name,
                                category: item.category,
                                location: item.location,
                                description: item.description,
                                interests: item.interests,
                              })
                            }
                          >
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content & Actions */}
                      <div className="p-3.5 space-y-3">
                        <div className="text-xs text-[#70798B] flex items-center justify-between">
                          <span className="flex items-center gap-1 truncate text-[#3D4654]">
                            <MapPin size={11} className="text-[#B87B22]" />
                            <span>{item.location || getPlaceRegion(item.name)}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#E5DFD5]">
                          <button
                            type="button"
                            onClick={() =>
                              onSelectPlace?.({
                                id: item.id,
                                name: item.name,
                                category: item.category,
                                location: item.location,
                                description: item.description,
                                interests: item.interests,
                              })
                            }
                            className="flex-1 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-semibold transition-colors text-center cursor-pointer border border-[#E5DFD5]"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onPlanWithSinglePlace) {
                                onPlanWithSinglePlace({
                                  id: item.id,
                                  name: item.name,
                                  category: item.category,
                                  location: item.location,
                                  description: item.description,
                                  interests: item.interests,
                                });
                              }
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs transition-colors text-center cursor-pointer"
                          >
                            Plan Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
