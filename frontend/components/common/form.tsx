"use client";

import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateFormData, resetForm } from "@/store/slices/formSlices";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type FormControlConfig = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  componentType: "input" | "select" | "textarea";
  options?: Array<{ id: string; label: string }>;
  validation?: z.ZodTypeAny;
  required?: boolean;
};

interface CommonFormProps<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  formControls: FormControlConfig[];
  buttonText: string;
  onSubmit: (data: T) => void;
  isBtnDisabled?: boolean;
  className?: string;
  isLoading?: boolean;
  defaultValues?: T;
  formData?: T;
}

const CommonForm = <T extends Record<string, unknown>>({
  formControls,
  buttonText,
  onSubmit,
  isBtnDisabled = false,
  className = "",
  isLoading,
}: CommonFormProps<T>) => {
  const dispatch = useAppDispatch();

  const generateFormSchema = useCallback(() => {
    const schemaMap: Record<string, z.ZodTypeAny> = {};

    formControls.forEach((control) => {
      if (control.validation) {
        schemaMap[control.name] = control.validation;
      } else if (control.required) {
        schemaMap[control.name] = z
          .string()
          .min(1, `${control.label} is required`);
      } else {
        schemaMap[control.name] = z.string().optional();
      }

      if (control.name === "email" || control.type === "email") {
        schemaMap[control.name] = z.string().email("Invalid email format");
      }
    });

    return z.object(schemaMap);
  }, [formControls]);

  const formSchema = generateFormSchema();
  type FormSchemaType = z.infer<typeof formSchema>;

  const defaultValues: Partial<FormSchemaType> = formControls.reduce(
    (acc, control) => {
      acc[control.name] = "";
      return acc;
    },
    {} as Partial<FormSchemaType>
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as FormSchemaType,
  });

  const handleChange = useCallback(
    (name: string, value: string) => {
      dispatch(updateFormData({ name, value }));
    },
    [dispatch]
  );

  const handleFormSubmit: SubmitHandler<FormSchemaType> = (data) => {
    if (typeof onSubmit === "function") {
      onSubmit(data as T);
    }
    dispatch(resetForm());
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={`space-y-4 ${className}`}
      >
        {formControls.map((control) => (
          <FormField
            key={control.name}
            control={form.control}
            name={control.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{control.label}</FormLabel>
                <FormControl>
                  {control.componentType === "input" && (
                    <Input
                      type={control.type || "text"}
                      placeholder={control.placeholder}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange(control.name, e.target.value);
                      }}
                    />
                  )}

                  {control.componentType === "select" && (
                    <Controller
                      name={control.name}
                      control={form.control}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value}
                          onValueChange={(newValue) => {
                            onChange(newValue);
                            handleChange(control.name, newValue);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={control.placeholder || control.label}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {control.options?.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}

                  {control.componentType === "textarea" && (
                    <Textarea
                      placeholder={control.placeholder}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange(control.name, e.target.value);
                      }}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          disabled={isBtnDisabled || form.formState.isSubmitting || isLoading}
          type="submit"
          className="w-full"
        >
          {isLoading ? "Loading..." : buttonText}
        </Button>
      </form>
    </Form>
  );
};

export default CommonForm;
