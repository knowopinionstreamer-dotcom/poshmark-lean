---
tag: [source-code, auto-sync]
last_synced: 2025-12-28T11:52:10.800Z
origin: src/app/dashboard/page.tsx
---

# page.tsx

```tsx
"use client"

import * as React from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, CheckCircle2, ArrowRight, FileText } from "lucide-react"

// Server Actions / AI Flows
import { performDraftGeneration } from "@/ai/flows/draft-generation"
import { performPricingResearch } from "@/ai/flows/pricing-research"
import { analyzeImagesToGenerateItemDetails } from "@/ai/flows/image-analysis-for-listing" 

// Local Components
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageUploader from "@/components/image-uploader"
import ImagePreview from "@/components/image-preview"
import ItemDetailsFields from "@/components/item-details-fields"
import PricingResearch from "@/components/pricing-research"
import ListingDraft from "@/components/listing-draft"
import { useToast } from "@/hooks/use-toast"
import { listingFormSchema, type ListingFormValues } from "@/app/schema"

const defaultDisclaimer = `

**BUYER INFORMATION (Please Read):**
- Photos are of actual sale item and accurately represent its condition. Any marks or imperfections should be in the photos.
- If you have any questions or concerns or want more photos, please ask BEFORE purchase.
- The items color may be slightly different due to your screen settings and lighting.
- Everything comes from a smoke-free, pet-free environment.
- All reasonable offers considered. Bundle 2 or more items for discounted Price and Shipping.
- Item is Cross-listed
- Thanks for looking! Check out my other listings for more great items and prices!!!`;

export default function PoshmarkProListerContent() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState("upload")
  
  // Loading States
  const [loadingStates, setLoadingStates] = React.useState({
    analysis: false,
    textSearch: false,
    draft: false,
  })

  // Local State for AI Results to pass to components
  const [pricingResults, setPricingResults] = React.useState<{
    searchQueries: string[];
    suggestedPrice?: number;
    demand?: string;
    valueDrivers?: string[];
    matchCount?: number;
    priceExplanation?: string;
  } | null>(null)

  // Initialize Form
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      images: [],
      analysisContext: '',
      brand: '',
      model: '',
      size: '',
      style: '',
      color: '',
      gender: '',
      condition: 'Good Pre-owned',
      title: '',
      description: '',
      scrapedText: '',
      keywords: '',
      disclaimer: defaultDisclaimer,
    },
  })

  // Watchers
  const images = form.watch('images')

  // --- HANDLERS ---

  const handleImageUpload = (newImages: string[]) => {
    const currentImages = form.getValues('images')
    form.setValue('images', [...currentImages, ...newImages], { shouldValidate: true })
  }

  const handleImageRemove = (index: number) => {
    const currentImages = form.getValues('images')
    const updatedImages = currentImages.filter((_, i) => i !== index)
    form.setValue('images', updatedImages, { shouldValidate: true })
  }

  const handleClearImages = () => {
    form.reset({
        images: [],
        analysisContext: '',
        brand: '',
        model: '',
        size: '',
        style: '',
        color: '',
        gender: '',
        condition: 'Good Pre-owned',
        title: '',
        description: '',
        scrapedText: '',
        keywords: '',
        targetPrice: undefined,
        disclaimer: defaultDisclaimer,
    })
    setPricingResults(null)
  }

  // STEP 1: ANALYZE
  const handleAnalyze = async () => {
    const currentImages = form.getValues('images')
    const context = form.getValues('analysisContext')

    if (currentImages.length === 0) {
        toast({ variant: 'destructive', title: 'No Images', description: 'Please upload images first.' })
        return
    }

    setLoadingStates(prev => ({ ...prev, analysis: true }))
    setActiveTab("details")

    try {
      const result = await analyzeImagesToGenerateItemDetails({
        photoDataUris: currentImages, // We send the full base64 strings to local Ollama
        analysisContext: context
      })

      if (result) {
        // Batch update form fields
        if(result.brand) form.setValue('brand', result.brand)
        if(result.model) form.setValue('model', result.model)
        if(result.styleNumber) form.setValue('styleNumber', result.styleNumber)
        if(result.style) form.setValue('style', result.style)
        if(result.color) form.setValue('color', result.color)
        if(result.gender) form.setValue('gender', result.gender)
        if(result.condition) form.setValue('condition', result.condition)
        if(result.description) form.setValue('description', result.description) // Initial visual description
        if(result.scrapedText) form.setValue('scrapedText', result.scrapedText)
        if(result.keywords) form.setValue('keywords', result.keywords)
        if(result.visualSearchQuery) form.setValue('visualSearchQuery', result.visualSearchQuery)
        
        toast({ title: "Analysis Complete", description: "Item details extracted from images." })
      }
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Analysis Failed", description: "Could not analyze images." })
    } finally {
      setLoadingStates(prev => ({ ...prev, analysis: false }))
    }
  }

  // STEP 2: PRICING
  const handleTextSearch = async () => {
    const { brand, model, styleNumber, size, condition, visualSearchQuery } = form.getValues()
    
    if (!brand || !model) {
        toast({ variant: 'destructive', title: 'Missing Info', description: 'Brand and Model are required.' })
        return
    }

    setLoadingStates(prev => ({ ...prev, textSearch: true }))
    setPricingResults(null)

    try {
        const result = await performPricingResearch({
            brand,
            model,
            styleNumber,
            size,
            condition: condition || 'Good Pre-owned',
            visualSearchQuery
        })

        setPricingResults({
            searchQueries: result.searchQueries,
            suggestedPrice: result.suggestedPrice,
            demand: result.demand,
            valueDrivers: result.valueDrivers,
            matchCount: result.matchCount,
            priceExplanation: result.priceExplanation
        })

        if (result.suggestedPrice) {
            form.setValue('targetPrice', result.suggestedPrice)
        }

        toast({ title: "Market Data Ready", description: "Pricing research complete." })
    } catch (error) {
        console.error(error)
        toast({ variant: "destructive", title: "Error", description: "Pricing research failed." })
    } finally {
        setLoadingStates(prev => ({ ...prev, textSearch: false }))
    }
  }

  // STEP 3: DRAFT
  const handleDraftGeneration = async () => {
    const values = form.getValues()
    
    setLoadingStates(prev => ({ ...prev, draft: true }))
    try {
        const result = await performDraftGeneration({
            brand: values.brand,
            model: values.model,
            styleNumber: values.styleNumber,
            style: values.style || "Item",
            color: values.color || "Multi",
            size: values.size,
            gender: values.gender,
            condition: values.condition || "Good Pre-owned",
        })

        form.setValue('title', result.title)
        // Append disclaimer if it exists and isn't already there
        const currentDesc = result.description
        const disclaimer = values.disclaimer || defaultDisclaimer
        form.setValue('description', currentDesc + "\n" + disclaimer)

        toast({ title: "Draft Generated", description: "Listing is ready for review." })
    } catch (error) {
        console.error(error)
        toast({ variant: "destructive", title: "Error", description: "Draft generation failed." })
    } finally {
        setLoadingStates(prev => ({ ...prev, draft: false }))
    }
  }

  // Navigation Helpers
  const handleContinueToPricing = () => {
    setActiveTab('pricing')
    handleTextSearch() // Auto-trigger pricing when moving to tab? Optional.
  }

  const itemDetailsFooter = (
    <>
       <Button 
           variant="outline" 
           onClick={() => setActiveTab('draft')}
           className="flex-1 sm:flex-none"
       >
           <FileText className="mr-2 h-4 w-4" />
           Skip Pricing & Generate Listing
       </Button>

       <Button 
           variant="secondary"
           onClick={handleContinueToPricing}
           className="flex-1 sm:flex-none"
       >
           Continue to AI Price Comparison
           <ArrowRight className="ml-2 h-4 w-4" />
       </Button>
   </>
 )

  return (
    <main className="container mx-auto p-4 md:p-8 h-screen flex flex-col">
      <header className="mb-6 text-center shrink-0">
        <h1 className="text-3xl font-bold text-primary">Poshmark Assistant (Local AI)</h1>
        <p className="text-muted-foreground">Unlimited, Free, Laptop-Native Reselling</p>
      </header>

      <FormProvider {...form}>
        <div className="flex-1 min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 shrink-0">
                    <TabsTrigger value="upload">1. Upload</TabsTrigger>
                    <TabsTrigger value="details">2. Details</TabsTrigger>
                    <TabsTrigger value="pricing">3. Pricing</TabsTrigger>
                    <TabsTrigger value="draft">4. Listing</TabsTrigger>
                </TabsList>

                {/* TAB 1: UPLOAD */}
                <TabsContent value="upload" className="flex-1 mt-4">
                    <ImageUploader 
                        images={images}
                        onImageUpload={handleImageUpload}
                        onImageRemove={handleImageRemove}
                        onClear={handleClearImages}
                        onAnalyze={handleAnalyze}
                        isLoading={loadingStates.analysis}
                    />
                </TabsContent>
                
                {/* TAB 2: DETAILS */}
                <TabsContent value="details" className="flex-1 mt-4 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <ImagePreview images={images} showClearButton={false} />
                        <ItemDetailsFields 
                            isAnalyzing={loadingStates.analysis} 
                            footerActions={itemDetailsFooter}
                        />
                    </div>
                </TabsContent>

                {/* TAB 3: PRICING */}
                <TabsContent value="pricing" className="flex-1 mt-4 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <ImagePreview images={images} showClearButton={false} />
                        <div className="space-y-4">
                            <PricingResearch 
                                onTextSearch={handleTextSearch}
                                isTextLoading={loadingStates.textSearch}
                                textQueries={pricingResults?.searchQueries || []}
                                suggestedPrice={pricingResults?.suggestedPrice}
                                demand={pricingResults?.demand}
                                valueDrivers={pricingResults?.valueDrivers}
                                matchCount={pricingResults?.matchCount}
                                priceExplanation={pricingResults?.priceExplanation}
                            />
                            <div className="flex justify-end">
                                <Button onClick={() => { setActiveTab("draft"); handleDraftGeneration(); }} size="lg" variant="secondary" className="w-full sm:w-auto">
                                    I have my price, go to Final Step <CheckCircle2 className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 4: LISTING DRAFT */}
                <TabsContent value="draft" className="flex-1 mt-4 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <ImagePreview images={images} showClearButton={false} />
                        <ListingDraft 
                            onGenerateDraft={handleDraftGeneration} 
                            isLoading={loadingStates.draft}
                        />
                        <div className="flex justify-end pb-8">
                            <Button size="lg" className="w-full sm:w-auto">
                                <Save className="mr-2 h-5 w-5" />
                                Save to Catalog (Local)
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </FormProvider>
    </main>
  )
}
```
