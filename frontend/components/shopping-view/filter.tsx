import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

interface FilterOption {
  id: string;
  label: string;
}

interface Filters {
  [key: string]: string[];
}

interface ProductFilterProps {
  filters: Filters;
  handleFilter: (category: string, optionId: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ filters, handleFilter }) => {
  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.entries(filterOptions).map(([keyItem, options]) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {options.map((option: FilterOption) => (
                  <Label key={option.id} className="flex font-medium items-center gap-2">
                    <Checkbox
                      checked={filters?.[keyItem]?.includes(option.id) ?? false}
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProductFilter;
