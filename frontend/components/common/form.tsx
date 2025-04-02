"use client";

import { FC, FormEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFormData, resetForm } from "@/store/slices/formSlices";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
  onSubmit: (formData: Record<string, string>) => void;
  buttonText?: string;
  isBtnDisabled?: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

type FormSchemaType = z.infer<typeof formSchema>;

const CommonForm: FC<CommonFormProps> = ({ formControls, onSubmit, buttonText = "Submit", isBtnDisabled = false }) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.form.data);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  const handleChange = useCallback((name: string, value: string) => {
    dispatch(updateFormData({ name, value }));
    setValue(name as keyof FormSchemaType, value);
  }, [dispatch, setValue]);

  const renderInputsByComponentType = useCallback(
    (controlItem: FormControl) => {
      const value = formData[controlItem.name] || "";

      switch (controlItem.componentType) {
        case "input":
          return (
            <>
              <Input
                id={controlItem.name}
                type={controlItem.type || "text"}
                placeholder={controlItem.placeholder}
                {...register(controlItem.name as keyof FormSchemaType)}
                onChange={(event) => handleChange(controlItem.name, event.target.value)}
              />
              {errors[controlItem.name as keyof FormSchemaType] && (
                <p className="text-red-500 text-sm">{errors[controlItem.name as keyof FormSchemaType]?.message}</p>
              )}
            </>
          );

        case "select":
          return (
            <>
              <Select onValueChange={(value) => handleChange(controlItem.name, value)} value={value}>
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
            </>
          );

        case "textarea":
          return (
            <Textarea
              id={controlItem.name}
              placeholder={controlItem.placeholder}
              {...register(controlItem.name as keyof FormSchemaType)}
              onChange={(event) => handleChange(controlItem.name, event.target.value)}
            />
          );

        default:
          return null;
      }
    },
    [formData, handleChange, register, errors]
  );

  const handleFormSubmit = (data: FormSchemaType) => {
    onSubmit(data);
    dispatch(resetForm());
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
