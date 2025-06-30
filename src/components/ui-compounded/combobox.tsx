"use client";

import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dispatch, SetStateAction, useState } from "react";

type ComboboxProps = {
  placeholder?: string;
  placeholderOnSearch?: string;
  emptyLabel?: string;
  emptyNode?: (
    val: string,
    setVal: Dispatch<SetStateAction<string>>
  ) => React.ReactNode;
  data: { value: string | number; label: string }[];
  value?: string;
  onSelect: (value: string) => void;
};
export function Combobox({
  placeholder,
  placeholderOnSearch,
  emptyLabel,
  emptyNode,
  data,
  value,
  onSelect,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? data.find((val) => val.value.toString() === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          {/* TODO: AQUIII- Oner caundo on change o asi */}
          <CommandInput
            value={searchVal}
            onValueChange={(val) => {
              setSearchVal(val);
            }}
            placeholder={placeholderOnSearch}
          />
          <CommandList>
            <CommandEmpty>
              {emptyNode ? emptyNode(searchVal, setSearchVal) : emptyLabel}
            </CommandEmpty>
            <CommandGroup>
              {data && data.length > 0 ? (
                data.map((val) => (
                  <CommandItem
                    key={val.value}
                    value={val.value.toString()}
                    onSelect={(currentValue) => {
                      onSelect(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === val.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {val.label}
                  </CommandItem>
                ))
              ) : (
                <></>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
