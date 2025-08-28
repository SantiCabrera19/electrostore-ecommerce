import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    
    // Try to get 'file' (singular) first, then 'files' (plural) for compatibility
    let files: File[] = []
    const singleFile = data.get('file') as File
    const multipleFiles = data.getAll('files') as File[]
    
    if (singleFile) {
      files = [singleFile]
    } else if (multipleFiles && multipleFiles.length > 0) {
      files = multipleFiles
    }
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 })
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      const bytes = await file.arrayBuffer()
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const uniqueFilename = `${uuidv4()}.${fileExtension}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error } = await supabase.storage
        .from('product-images')
        .upload(uniqueFilename, bytes, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Failed to upload ${file.name}: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(uniqueFilename)
      
      uploadedFiles.push(publicUrl)
    }

    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      url: uploadedFiles[0] // For single file compatibility
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
  }
}
