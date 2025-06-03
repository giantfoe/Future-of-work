"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, AlertCircle, Upload, X, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface SubmissionFormProps {
  bountyId: string
  bountyName: string
  status: string
  deadline: string
  isDetailsPage?: boolean
}

// Define allowed file types and max size
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]
const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB per file (increased from 10MB)
const MAX_FILES = 3 // Maximum number of files
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB total

export default function SubmissionForm({
  bountyId,
  bountyName,
  status,
  deadline,
  isDetailsPage = false,
}: SubmissionFormProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false)
  const [submissionCheckComplete, setSubmissionCheckComplete] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>(
    "Your submission has been received! We'll review it and get back to you soon."
  )
  const [totalFileSize, setTotalFileSize] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Check if user has already submitted for this bounty
  useEffect(() => {
    const checkExistingSubmission = async () => {
      // Wait for auth to finish loading first
      if (authLoading) {
        return
      }

      // If no user or bountyId, mark check as complete
      if (!user?.id || !bountyId) {
        setSubmissionCheckComplete(true)
        return
      }

      try {
        const response = await fetch(`/api/submissions/check?userId=${user.id}&bountyId=${bountyId}`)
        const result = await response.json()
        setHasAlreadySubmitted(result.hasSubmitted)
      } catch (error) {
        console.error('Error checking existing submission:', error)
        setHasAlreadySubmitted(false)
      } finally {
        setSubmissionCheckComplete(true)
      }
    }

    checkExistingSubmission()
  }, [user?.id, bountyId, authLoading])

  // Don't render anything until auth is loaded AND submission check is complete
  if (authLoading || !submissionCheckComplete) {
    return null
  }

  // Check if the bounty is closed or deadline has passed
  const isDeadlinePassed = new Date() > new Date(deadline)
  const isClosed = status === "closed"
  // Form is disabled if bounty is closed, deadline passed, or user already submitted
  const isDisabled = isClosed || isDeadlinePassed || hasAlreadySubmitted

  // If the bounty is closed or deadline passed and we're on the details page,
  // we don't need to render the form at all as the parent component will handle it
  if ((isClosed || isDeadlinePassed) && isDetailsPage) {
    return null
  }

  // Calculate total file size
  const calculateTotalSize = (fileList: File[]): number => {
    return fileList.reduce((total, file) => total + file.size, 0)
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const newErrors: string[] = []
    const newFiles: File[] = [...files]
    let newTotalSize = totalFileSize

    // Check if adding these files would exceed the maximum count
    if (files.length + selectedFiles.length > MAX_FILES) {
      newErrors.push(`You can only upload a maximum of ${MAX_FILES} files.`)
      setFileErrors(newErrors)
      return
    }

    // Validate each file
    selectedFiles.forEach((file) => {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        newErrors.push(`File "${file.name}" has an unsupported format.`)
        return
      }

      // Check individual file size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`File "${file.name}" exceeds the maximum size of 30MB.`)
        return
      }

      // Check if adding this file would exceed total size limit
      if (newTotalSize + file.size > MAX_TOTAL_SIZE) {
        newErrors.push(`Adding "${file.name}" would exceed the total attachment size limit of 50MB.`)
        return
      }

      // File is valid, add it
      newFiles.push(file)
      newTotalSize += file.size
    })

    setFileErrors(newErrors)
    setFiles(newFiles)
    setTotalFileSize(newTotalSize)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const newErrors: string[] = []
      const newFiles: File[] = [...files]
      let newTotalSize = totalFileSize

      // Check if adding these files would exceed the maximum count
      if (files.length + droppedFiles.length > MAX_FILES) {
        newErrors.push(`You can only upload a maximum of ${MAX_FILES} files.`)
        setFileErrors(newErrors)
        return
      }

      // Validate each file
      droppedFiles.forEach((file) => {
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          newErrors.push(`File "${file.name}" has an unsupported format.`)
          return
        }

        // Check individual file size
        if (file.size > MAX_FILE_SIZE) {
          newErrors.push(`File "${file.name}" exceeds the maximum size of 30MB.`)
          return
        }

        // Check if adding this file would exceed total size limit
        if (newTotalSize + file.size > MAX_TOTAL_SIZE) {
          newErrors.push(`Adding "${file.name}" would exceed the total attachment size limit of 50MB.`)
          return
        }

        // File is valid, add it
        newFiles.push(file)
        newTotalSize += file.size
      })

      setFileErrors(newErrors)
      setFiles(newFiles)
      setTotalFileSize(newTotalSize)
    }
  }

  // Remove a file from the list
  const removeFile = (index: number) => {
    const fileToRemove = files[index]
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    setTotalFileSize(totalFileSize - fileToRemove.size)

    // Clear any errors that might be related to total size
    if (fileErrors.some((err) => err.includes("total attachment size"))) {
      setFileErrors(fileErrors.filter((err) => !err.includes("total attachment size")))
    }
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setUploadSuccess(false)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      if (!user) {
        setError("You must be signed in to submit.")
        setIsSubmitting(false)
        setIsUploading(false)
        return
      }
      // Debug: log user object
      console.log('SubmissionForm user:', user)
      if (!user.name) {
        setError("Please finish setting up your profile to submit")
        setIsSubmitting(false)
        setIsUploading(false)
        return
      }
      if (!user.university) {
        setError("Please finish setting up your profile to submit")
        setIsSubmitting(false)
        setIsUploading(false)
        return
      }
      // Get form data
      const formData = new FormData(event.currentTarget)
      const submissionLink = formData.get("submissionLink") as string
      const walletAddress = formData.get("walletAddress") as string

      // Add files to FormData
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      // Add other necessary fields from user context
      formData.append("bountyId", bountyId)
      formData.append("bountyName", bountyName)
      formData.append("fullName", user.name || "")
      formData.append("userId", user.id)
      // University is now required from user profile
      formData.append("university", user.university || "")

      // Start progress updates with more realistic progression
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          // More realistic progress simulation based on file count and size
          const fileCount = files.length || 1
          const totalSize = totalFileSize || 1

          // Smaller increments for more/larger files
          // Adjust the increment calculation to account for larger files
          const increment = Math.min(100 / (fileCount * 5 + totalSize / 2000000), 3)
          const newProgress = prev + increment

          return newProgress > 85 ? 85 : newProgress // Cap at 85% until complete
        })
      }, 800)

      // Submit the form data directly to the API
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      })

      // Clear the interval and set to 100%
      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (response.ok && result.success) {
        setUploadSuccess(true)
        setSuccess(true)

        // Safely reset the form using the ref instead of event.currentTarget
        if (formRef.current) {
          formRef.current.reset()
        }

        setFiles([])
        setFileErrors([])
        setTotalFileSize(0)

        // Display the specific success message from the server
        if (result.message) {
          setSuccessMessage(result.message)
        } else {
          setSuccessMessage("Your submission has been received! We'll review it and get back to you soon.")
        }

        // Refresh the page data
        router.refresh()
        // Scroll to top of form
        document.getElementById("submission-form")?.scrollIntoView({ behavior: "smooth" })
      } else {
        setError(result.message || "Failed to submit application. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setIsUploading(false)
      }, 500) // Small delay to ensure progress animation completes
    }
  }

  // Function to handle view bounty click
  const handleViewBounty = () => {
    router.push(`/bounties/${bountyId}`)
  }

  return (
    <div>
      {hasAlreadySubmitted && (
        <Alert className="mb-6 notification-warning">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle className="text-green-200">Already Submitted</AlertTitle>
          <AlertDescription className="text-green-100">
            You have already submitted for this bounty. Only one submission per user is allowed.
          </AlertDescription>
        </Alert>
      )}

      {isDisabled && !hasAlreadySubmitted && (
        <Alert className="mb-6 notification-warning">
          <AlertDescription className="text-amber-100">
            {isDeadlinePassed
              ? "The deadline for this bounty has passed."
              : "This bounty has been closed."}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 notification-error">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-200">Error</AlertTitle>
          <AlertDescription className="text-red-100">
            {error}
            {error.includes("profile") && (
              <span className="block mt-2">
                <Link href="/profile/edit" className="underline text-blue-400 hover:text-blue-300 transition-colors">Complete Profile</Link>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 notification-success">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle className="text-green-200">Success</AlertTitle>
          <AlertDescription className="text-green-100">{successMessage}</AlertDescription>
        </Alert>
      )}

      {isDisabled ? (
        <div className="space-y-6">
          <p className="text-gray-500">
            {hasAlreadySubmitted
              ? "You have already submitted for this bounty. Only one submission per user is allowed."
              : isDeadlinePassed
                ? "The deadline for this bounty has passed and it is no longer accepting submissions."
                : "This bounty has been completed and is no longer accepting submissions."}
          </p>

          {/* Only show the View Bounty button if we're NOT on the details page */}
          {!isDetailsPage && (
            <Button
              type="button"
              className="w-full h-12 flex items-center justify-center gap-2"
              onClick={handleViewBounty}
            >
              <Eye className="h-5 w-5" />
              View Bounty Details
            </Button>
          )}

          {/* Show a different message if we are on the details page */}
          {isDetailsPage && (
            <div className="flex items-center justify-center gap-2 p-4 notification-warning rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <p className="text-sm font-medium text-amber-100">
                {hasAlreadySubmitted
                  ? "You have already submitted for this bounty."
                  : "Submissions are currently not being accepted for this bounty."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <form id="submission-form" ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="submissionLink">Submission Link</Label>
            <Input
              id="submissionLink"
              name="submissionLink"
              type="url"
              placeholder="https://..."
              required
              className="h-10"
            />
            <p className="text-sm text-muted-foreground">Link to your work (GitHub, Figma, Google Drive, etc.)</p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="files" className="text-base font-medium">
                Supporting Documents (Optional)
              </Label>
              <span className="bg-transparent border border-[#FBF6E8] text-[#FBF6E8] rounded-full px-3 py-1 text-sm transition-colors duration-200 hover:bg-[#FBF6E8]/10">
                Max size: 30MB
              </span>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                files.length > 0
                  ? "border-[#5865F2]/50 bg-[#1F3B54]/10"
                  : "border-[#1F3B54]/30"
              } focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#5865F2]/50 hover:border-[#5865F2]/40`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              tabIndex={0}
              role="button"
              aria-label="Upload files by clicking or dragging and dropping"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 mb-4 rounded-full bg-[#1F3B54]/30 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-[#C4C9D2]" />
                </div>
                <p className="text-base font-medium text-[#FBF6E8] mb-2">Drag and drop your files here</p>
                <p className="text-sm text-[#C4C9D2] text-center mb-4">or click to browse from your computer</p>
                <input
                  ref={fileInputRef}
                  id="files"
                  name="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                  accept={ALLOWED_FILE_TYPES.join(",")}
                  aria-label="File upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  disabled={files.length >= MAX_FILES || totalFileSize >= MAX_TOTAL_SIZE}
                >
                  Browse Files
                </Button>

                <div className="w-full mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between w-full px-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {files.length} of {MAX_FILES} files used
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(files.length / MAX_FILES) * 100}
                        className="h-1.5 w-16 rounded-full"
                        aria-label="File count usage"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {Math.round((files.length / MAX_FILES) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full px-2">
                    <p className="text-xs font-medium text-muted-foreground">Storage used</p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(totalFileSize / MAX_TOTAL_SIZE) * 100}
                        className="h-1.5 w-16 rounded-full"
                        aria-label="Total file size usage"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {Math.round((totalFileSize / MAX_TOTAL_SIZE) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Error Messages */}
            {fileErrors.length > 0 && (
              <div className="mt-2 p-4 notification-error">
                <h4 className="text-sm font-semibold text-red-200 mb-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 text-red-400" />
                  File Upload Error
                </h4>
                {fileErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-100 flex items-center mb-1 last:mb-0 pl-6">
                    • {error}
                  </p>
                ))}
                <p className="text-xs text-red-200 mt-2 pl-6">
                  Please remove or replace the problematic file(s) before submitting.
                </p>
              </div>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-[#FBF6E8] mb-2">Selected Files:</p>
                <ul className="space-y-2 bg-[#1F3B54]/10 rounded-lg border border-[#1F3B54]/30 p-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1F3B54]/20 rounded-md border border-[#1F3B54]/40 shadow-sm transition-all hover:bg-[#1F3B54]/30 hover:border-[#5865F2]/40"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-[#1F3B54]/40 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileText className="h-4 w-4 text-[#C4C9D2]" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-[#FBF6E8] truncate">{file.name}</p>
                          <p className="text-xs text-[#C4C9D2]">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0 rounded-full hover:bg-red-500/20 hover:text-red-400 text-[#C4C9D2]"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        aria-label={`Remove file ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* File upload guidelines */}
            <div className="mt-2 bg-transparent border border-[#1F3B54] rounded-md px-4 py-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-[#FBF6E8] mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-[#FBF6E8] mb-2">File Upload Guidelines</h4>
                  <ul className="text-xs text-[#C4C9D2] space-y-1.5 pl-4 list-disc">
                    <li>Supported formats: PDF, Word, Excel, PowerPoint, images, text, and ZIP files</li>
                    <li>Maximum 3 files can be uploaded</li>
                    <li>Each file must be under 30MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              name="walletAddress"
              required
              placeholder="Solana wallet address"
              className="h-10"
            />
            <p className="text-sm text-muted-foreground">
              This is NOT your home address. This is your Solana wallet address for bounty payouts.
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {uploadSuccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <span className="animate-pulse mr-2">⬤</span>
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {uploadSuccess ? "Files uploaded successfully!" : "Uploading files..."}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
              <Progress
                value={uploadProgress}
                className="h-2"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(uploadProgress)}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#FBF6E8] text-[#091C2E] rounded-md transition-colors duration-200 hover:bg-[#f8eed7]"
            disabled={isSubmitting || isDeadlinePassed || fileErrors.length > 0}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                {isUploading && <span>({Math.round(uploadProgress)}%)</span>}
              </>
            ) : (
              "Submit Application"
            )}
          </Button>

          {/* File size warning */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Note: Large files may take longer to upload. If you experience timeout issues, try submitting with fewer or
            smaller files.
          </p>
        </form>
      )}
    </div>
  )
}
