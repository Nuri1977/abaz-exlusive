"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { brandOptions, genderOptions } from "@/utils/constants";

const materialOptions = [
  "Leather",
  "Synthetic",
  "Mesh",
  "Canvas",
  "Suede",
  "Rubber",
  "Textile",
];

const styleOptions = [
  "Casual",
  "Formal",
  "Sports",
  "Running",
  "Sneakers",
  "Boots",
  "Sandals",
  "Loafers",
];

const featureOptions = [
  "Waterproof",
  "Breathable",
  "Cushioned",
  "Slip-resistant",
  "Lightweight",
  "Arch support",
  "Memory foam",
];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 1000,
      ]);
    }
  }, [searchParams]);

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
    setPriceRange([value[0], value[1]]);
  };

  const handlePriceChangeEnd = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", value[0].toString());
    params.set("maxPrice", value[1].toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <Card className="space-y-6 p-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Price Range</h3>
        <div className="space-y-4">
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:rounded-full [&_[role=slider]]:border-2 [&_[role=slider]]:bg-white"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
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
            <SelectItem value="all">All</SelectItem>
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
            <SelectItem value="all">All</SelectItem>
            {genderOptions.map((gender) => (
              <SelectItem key={gender.value} value={gender.value}>
                {gender.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
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

      <div className="space-y-4">
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

      <div className="space-y-4">
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
    </Card>
  );
}
