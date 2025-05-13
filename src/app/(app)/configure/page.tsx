"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateHVACConfiguration, type GenerateHVACConfigurationInput, type GenerateHVACConfigurationOutput } from '@/ai/flows/generate-hvac-configuration';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  buildingDescription: z.string().min(10, "Please provide a more detailed building description."),
  usagePatterns: z.string().min(10, "Please describe usage patterns in more detail."),
  desiredComfortLevels: z.string().min(5, "Please specify desired comfort levels."),
});

type ConfigurationFormValues = z.infer<typeof formSchema>;

export default function ConfigurePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<GenerateHVACConfigurationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ConfigurationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buildingDescription: "",
      usagePatterns: "",
      desiredComfortLevels: "",
    },
  });

  async function onSubmit(values: ConfigurationFormValues) {
    setIsLoading(true);
    setGeneratedConfig(null);
    try {
      const result = await generateHVACConfiguration(values as GenerateHVACConfigurationInput);
      setGeneratedConfig(result);
      toast({
        title: "Configuration Generated",
        description: "HVAC configuration has been successfully generated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating HVAC configuration:", error);
      toast({
        title: "Error",
        description: "Failed to generate HVAC configuration. Please try again.",
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
              <CardTitle className="text-xl">System Inputs</CardTitle>
              <CardDescription>Provide details about your building and preferences to generate an optimized HVAC configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="buildingDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Building Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 10,000 sq ft office building, 2 floors, large glass windows on south side, brick construction..."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the building size, materials, layout, and any unique architectural features.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usagePatterns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Usage Patterns</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Monday-Friday 9am-6pm occupancy, high traffic in lobby during mornings, server room 24/7 operation..."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detail how the building is used, including occupancy schedules and activities in different zones.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredComfortLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Desired Comfort Levels</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Temperature: 22-24°C, Humidity: 40-60%" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Specify target temperature ranges, humidity levels, or other comfort preferences.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto ml-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Configuration
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {generatedConfig && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Generated HVAC Configuration</CardTitle>
            <CardDescription>The AI has generated the following initial configuration based on your inputs.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm text-muted-foreground overflow-x-auto">
              {generatedConfig.hvacConfiguration}
            </pre>
          </CardContent>
           <CardFooter>
            <Button variant="outline" className="ml-auto">Copy Configuration</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
