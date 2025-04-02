"use client";

import { FC, ChangeEvent, FormEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFormData } from "@/store/slices/formSlice";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface FormControl {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  componentType: "input" | "select" | "textarea";
  options?: { id: string; label: string }[];
}

interface CommonFormProps {
  formControls: FormControl[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  buttonText?: string;
  isBtnDisabled?: boolean;
}

const CommonForm: FC<CommonFormProps> = ({
  formControls,
  onSubmit,
  buttonText = "Submit",
  isBtnDisabled = false,
}) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.form.data);

  const handleChange = useCallback(
    (name: string, value: string) => {
      dispatch(updateFormData({ [name]: value }));
    },
    [dispatch]
  );

  const renderInputsByComponentType = useCallback(
    (controlItem: FormControl) => {
      const value = formData[controlItem.name] || "";

      switch (controlItem.componentType) {
        case "input":
          return (
            <Input
              id={controlItem.name}
              name={controlItem.name}
              type={controlItem.type || "text"}
              placeholder={controlItem.placeholder}
              value={value}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(controlItem.name, event.target.value)
              }
            />
          );

        case "select":
          return (
            <Select
              onValueChange={(value) => handleChange(controlItem.name, value)}
              value={value}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={controlItem.label} />
              </SelectTrigger>
              <SelectContent>
                {controlItem.options?.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "textarea":
          return (
            <Textarea
              id={controlItem.name}
              name={controlItem.name}
              placeholder={controlItem.placeholder}
              value={value}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange(controlItem.name, event.target.value)
              }
            />
          );

        default:
          return null;
      }
    },
    [formData, handleChange]
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formControls.map((controlItem) => (
        <div key={controlItem.name} className="grid gap-1.5">
          <Label htmlFor={controlItem.name}>{controlItem.label}</Label>
          {renderInputsByComponentType(controlItem)}
        </div>
      ))}
      <Button disabled={isBtnDisabled} type="submit" className="w-full">
        {buttonText}
      </Button>
    </form>
  );
};

export default CommonForm;