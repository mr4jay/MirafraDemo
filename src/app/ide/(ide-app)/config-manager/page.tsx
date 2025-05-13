
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditorPlaceholder } from "@/components/ide/code-editor-placeholder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, FileJson, FileText, ShieldCheck, UploadCloud } from "lucide-react";

const exampleAlgoParamsJson = \`{
  "algorithm_type": "heuristic",
  "parameters": {
    "heuristic_rules_s3_path": "s3://hvac-configs/heuristic_rules_v1.json",
    "max_cooling_reduction_percent": 20
  }
}\`;

const exampleCloudFormationYaml = \`
AWSTemplateFormatVersion: '2010-09-09'
Description: HVAC Optimizer Lambda Function

Parameters:
  FunctionName:
    Type: String
    Default: HvacControlAlgorithmFunction
  S3BucketName:
    Type: String
    Description: S3 bucket for Lambda code
  S3KeyName:
    Type: String
    Description: S3 key for Lambda code zip file

Resources:
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        # Add more policies for S3, DynamoDB, IoT access if needed

  HvacLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Ref FunctionName
      Runtime: python3.9
      Handler: index.lambda_handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        S3Bucket: !Ref S3BucketName
        S3Key: !Ref S3KeyName
      Timeout: 60 # seconds
      MemorySize: 256 # MB

Outputs:
  LambdaFunctionArn:
    Description: ARN of the created Lambda function
    Value: !GetAtt HvacLambdaFunction.Arn
\`;

export default function ConfigManagerPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,8rem))] gap-4">
      <Card>
        <CardHeader>
          <CardTitle>AWS Configuration Manager</CardTitle>
          <CardDescription>Manage algorithm parameters and AWS resource configurations.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
            <Button variant="default"><Save className="mr-2 h-4 w-4" /> Save All Configurations</Button>
            <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Deploy Changes</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="algoParams" className="flex-grow flex flex-col">
        <TabsList className="mb-2 self-start">
          <TabsTrigger value="algoParams"><FileJson className="mr-2 h-4 w-4"/> Algorithm Parameters</TabsTrigger>
          <TabsTrigger value="cloudformation"><FileText className="mr-2 h-4 w-4"/> CloudFormation</TabsTrigger>
          <TabsTrigger value="iamConfig"><ShieldCheck className="mr-2 h-4 w-4"/> IAM & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="algoParams" className="flex-grow">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Algorithm Parameters</CardTitle>
              <CardDescription>Define and manage parameters for your control algorithms (JSON format).</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-10rem)]"> {/* Adjust height to fit editor */}
              <CodeEditorPlaceholder title="parameters.json" defaultCode={exampleAlgoParamsJson} language="json" />
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">Parameters are typically stored in S3 and loaded by Lambda functions.</p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="cloudformation" className="flex-grow">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">CloudFormation Templates</CardTitle>
              <CardDescription>Edit and manage AWS CloudFormation templates (YAML/JSON) for your infrastructure.</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-10rem)]">
              <CodeEditorPlaceholder title="hvac_stack.yaml" defaultCode={exampleCloudFormationYaml} language="yaml" />
            </CardContent>
             <CardFooter>
                <Button><UploadCloud className="mr-2 h-4 w-4" /> Validate & Deploy Stack</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="iamConfig" className="flex-grow">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">IAM Roles & Security</CardTitle>
              <CardDescription>Configure IAM roles, policies, and security group settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lambdaRoleArn">Lambda Execution Role ARN</Label>
                <Input id="lambdaRoleArn" placeholder="arn:aws:iam::123456789012:role/HvacLambdaRole" />
              </div>
              <div>
                <Label htmlFor="s3Policy">S3 Bucket Policy (JSON)</Label>
                 <Textarea placeholder='{ "Version": "2012-10-17", "Statement": [...] }' rows={5} className="font-mono text-xs"/>
              </div>
               <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Apply Security Settings</Button>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Ensure least privilege access for all AWS resources.</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Need Textarea for this component
import { Textarea } from "@/components/ui/textarea";
