
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const formSchema = z.object({
  algorithmType: z.enum(["heuristic", "optimization", "ai_ml"], {
    required_error: "You need to select an algorithm type.",
  }),
  costComfortWeight: z.number().min(0).max(1).default(0.5)
    .describe("Slider for cost vs comfort: 0 for max comfort, 1 for max cost saving."),
  additionalParams: z.string().optional().describe("Additional parameters in JSON format if needed."),
});

type ConfigurationFormValues = z.infer<typeof formSchema>;

export default function ConfigurePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [appliedConfigStatus, setAppliedConfigStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ConfigurationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithmType: undefined, 
      costComfortWeight: 0.5,
      additionalParams: "",
    },
  });

  async function onSubmit(values: ConfigurationFormValues) {
    setIsLoading(true);
    setAppliedConfigStatus(null);
    console.log("Submitting configuration to backend API:", values);
    try {
      // TODO: Replace with actual API call to backend
      // Example:
      // const response = await fetch('/api/hvac-system-config', { 
      //   method: 'POST', 
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify(values) 
      // });
      // if (!response.ok) throw new Error('Network response was not ok.');
      // const result = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      setAppliedConfigStatus(`Configuration for '${values.algorithmType}' (Weight: ${values.costComfortWeight.toFixed(2)}) submitted successfully.`);
      toast({
        title: "Configuration Submitted",
        description: `Settings for '${values.algorithmType}' algorithm have been submitted to the system.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error applying HVAC configuration:", error);
      setAppliedConfigStatus("Failed to apply configuration. Please check logs or try again.");
      toast({
        title: "Error",
        description: "Failed to apply HVAC configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Dynamic HVAC Configuration</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Algorithm & Preference Configuration</CardTitle>
              <CardDescription>Select the control algorithm and adjust preferences for HVAC optimization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="algorithmType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Algorithm Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select algorithm type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="heuristic">Heuristic (Rule-based)</SelectItem>
                        <SelectItem value="optimization">Optimization (e.g., Linear Programming)</SelectItem>
                        <SelectItem value="ai_ml">AI/ML (e.g., LSTM predictive control)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="caption">
                      Choose the primary control strategy for the HVAC system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costComfortWeight"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel className="text-base">Cost vs. Comfort Priority</FormLabel>
                    <div className="flex items-center gap-4 py-2">
                        <span className="caption text-muted-foreground">Max Comfort</span>
                        <FormControl>
                           <Slider
                            defaultValue={[value ?? 0.5]}
                            max={1}
                            step={0.01}
                            onValueChange={(vals) => onChange(vals[0])}
                            className="flex-1"
                            aria-label="Cost vs Comfort Slider"
                          />
                        </FormControl>
                        <span className="caption text-muted-foreground">Max Savings</span>
                    </div>
                     <FormDescription className="caption">
                      Adjust the balance. 0 leans to comfort, 1 to cost savings. Current: {value?.toFixed(2)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalParams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Additional Parameters (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='e.g., {"temp_threshold_heuristic": 25, "ml_retrain_interval": "7d"}'
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="caption">
                      Specific parameters for the selected algorithm (JSON format), if applicable.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto ml-auto">
                {isLoading ? (
                  "Applying..."
                ) : (
                  <AutoAwesomeIcon className="mr-2 h-4 w-4" />
                )}
                Apply Configuration
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {appliedConfigStatus && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Configuration Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {appliedConfigStatus}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
