import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

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
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const uniqueFilename = `${uuidv4()}.${fileExtension}`
      
      // Save to public directory
      const publicPath = join(process.cwd(), 'public', uniqueFilename)
      await writeFile(publicPath, buffer)
      
      uploadedFiles.push(uniqueFilename)
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
