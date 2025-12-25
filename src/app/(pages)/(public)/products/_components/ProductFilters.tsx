"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";

import {
  brandOptions,
  genderOptions,
  materialOptions,
  styleOptions,
} from "@/constants/options";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const featureOptions = [
  "Waterproof",
  "Breathable",
  "Cushioned",
  "Slip-resistant",
  "Lightweight",
  "Arch support",
  "Memory foam",
];

interface CollectionOption {
  id: string;
  name: string;
  slug: string;
}

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency, convertPrice, currencySymbol } = useCartContext();

  // Fetch collections for filtering
  const { data: collections = [] } = useQuery<CollectionOption[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }
      return response.json() as Promise<CollectionOption[]>;
    },
  });

  // Set slider min/max based on currency
  const sliderMax = currency === "MKD" ? 300000 : 5000;
  const sliderMin = 0;

  // Helper to convert MKD to selected currency
  const mkdToCurrency = (mkd: number) => convertPrice(mkd, "MKD", currency);
  // Helper to convert selected currency to MKD
  const currencyToMKD = (val: number) => convertPrice(val, currency, "MKD");

  // State is always in selected currency
  const [priceRange, setPriceRange] = useState<[number, number]>([
    sliderMin,
    sliderMax,
  ]);

  // On mount or when searchParams/currency changes, update slider value to reflect search params in selected currency
  useEffect(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    let min = sliderMin;
    let max = sliderMax;
    if (minPrice) min = Math.round(mkdToCurrency(parseInt(minPrice)));
    if (maxPrice) max = Math.round(mkdToCurrency(parseInt(maxPrice)));
    // Clamp to slider range
    min = Math.max(sliderMin, Math.min(min, sliderMax));
    max = Math.max(sliderMin, Math.min(max, sliderMax));
    setPriceRange([min, max]);
  }, [searchParams, currency]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const selectedFeatures = searchParams.get("features")?.split(",") || [];

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const newFeatures = checked
      ? [...selectedFeatures, feature]
      : selectedFeatures.filter((f) => f !== feature);

    if (newFeatures.length) {
      params.set("features", newFeatures.join(","));
    } else {
      params.delete("features");
    }

    router.push(`/products?${params.toString()}`);
  };

  const handlePriceChange = (value: number[]) => {
    const min = typeof value[0] === "number" ? value[0] : sliderMin;
    const max = typeof value[1] === "number" ? value[1] : sliderMax;
    setPriceRange([min, max]);
  };

  // When user finishes sliding, convert selected currency range to MKD for API
  const handlePriceChangeEnd = (value: number[]) => {
    const min = typeof value[0] === "number" ? value[0] : sliderMin;
    const max = typeof value[1] === "number" ? value[1] : sliderMax;
    const minMKD = Math.round(currencyToMKD(min));
    const maxMKD = Math.round(currencyToMKD(max));
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", minMKD.toString());
    params.set("maxPrice", maxMKD.toString());
    router.push(`/products?${params.toString()}`);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Price Range</h3>
        <div className="space-y-4">
          <DualRangeSlider
            min={sliderMin}
            max={sliderMax}
            step={currency === "MKD" ? 100 : 10}
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            className="[&_[role=slider]]:size-4 [&_[role=slider]]:rounded-full [&_[role=slider]]:border-2 [&_[role=slider]]:bg-white"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {currencySymbol} {priceRange[0].toLocaleString()}
            </span>
            <span>
              {currencySymbol} {priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Brand</h3>
        <Select
          value={searchParams.get("brand") || ""}
          onValueChange={(value) => updateFilters("brand", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {brandOptions.map((brand) => (
              <SelectItem key={brand.value} value={brand.value}>
                {brand.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Gender</h3>
        <Select
          value={searchParams.get("gender") || ""}
          onValueChange={(value) => updateFilters("gender", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((gender) => (
              <SelectItem key={gender.value} value={gender.value}>
                {gender.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Collection</h3>
        <Select
          value={searchParams.get("collection") || ""}
          onValueChange={(value) => updateFilters("collection", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {collections.map((collection: CollectionOption) => (
              <SelectItem key={collection.id} value={collection.slug}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden space-y-4">
        <h3 className="font-semibold">Material</h3>
        <Select
          value={searchParams.get("material") || ""}
          onValueChange={(value) => updateFilters("material", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {materialOptions.map((material) => (
              <SelectItem key={material} value={material.toLowerCase()}>
                {material}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden space-y-4">
        <h3 className="font-semibold">Style</h3>
        <Select
          value={searchParams.get("style") || ""}
          onValueChange={(value) => updateFilters("style", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {styleOptions.map((style) => (
              <SelectItem key={style} value={style.toLowerCase()}>
                {style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden space-y-4">
        <h3 className="font-semibold">Features</h3>
        <div className="space-y-2">
          {featureOptions.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={selectedFeatures.includes(feature.toLowerCase())}
                onCheckedChange={(checked) =>
                  handleFeatureChange(feature.toLowerCase(), checked as boolean)
                }
              />
              <Label htmlFor={feature}>{feature}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger */}
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 size-4" />
              Show Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search with the following options.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8">
              <FilterContent />
            </div>
            <div className="mt-6 flex justify-end">
              <SheetClose asChild>
                <Button className="w-full">
                  Apply Filters
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <Card className="hidden space-y-6 p-4 md:block">
        <FilterContent />
      </Card>
    </>
  );
}
