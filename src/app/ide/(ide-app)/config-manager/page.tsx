"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditorPlaceholder } from "@/components/ide/code-editor-placeholder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, FileJson, FileText, ShieldCheck, UploadCloud, Settings, Rocket, KeyRound, GitMerge } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const exampleAlgoParamsJson = `{
  "schema_version": "1.0",
  "algorithm_type": "heuristic", // Dropdown: heuristic, optimization, ai_ml
  "parameters": {
    "heuristic_rules_s3_path": "s3://hvac-configs-prod/heuristic_rules_v2.json", // S3 URI input
    "max_cooling_reduction_percent": 25, // Number input, min:0, max:100
    "comfort_deadband_celsius": 1.5, // Number input, step:0.1
    "enable_pre_cooling": true // Boolean toggle
  },
  "metadata": {
    "version": "2.1.0",
    "description": "Heuristic control parameters for office building, optimized for balanced mode.",
    "last_updated_by": "data_engineer_ide_user",
    "last_updated_ts": "2025-05-15T10:30:00Z"
  }
}`;

const exampleCloudFormationYaml = `
AWSTemplateFormatVersion: '2010-09-09'
Description: HVAC Optimizer - Core Infrastructure Stack (v1.2)

Parameters:
  EnvironmentName:
    Type: String
    Default: production
    Description: Deployment environment (e.g., dev, staging, production).
  S3BucketNameHVACData:
    Type: String
    Description: Name for the S3 bucket to store raw HVAC timeseries data.
    Default: hvac-optimizer-data-raw-\${EnvironmentName}
  LambdaMemorySizeMB:
    Type: Number
    Default: 512
    Description: Memory allocation for HVAC control Lambda functions.

Resources:
  HVACDataBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref S3BucketNameHVACData
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: ArchiveOldData
            Status: Enabled
            ExpirationInDays: 365 # Archive raw data after 1 year
            Transitions:
              - StorageClass: GLACIER
                TransitionInDays: 90 # Move to Glacier after 90 days

  IAMRoleHVACLambda:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub HvacOptimizerLambdaRole-\${EnvironmentName}
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal: { Service: lambda.amazonaws.com }
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies: # Inline policy for S3, DynamoDB, IoT access
        - PolicyName: HvacLambdaPermissions
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: [ "s3:GetObject", "s3:PutObject" ]
                Resource: !Sub arn:aws:s3:::\${S3BucketNameHVACData}/*
              # Add permissions for DynamoDB, IoT Core, SageMaker, Athena as needed

  HVACControlLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub HvacControlAlgorithm-\${EnvironmentName}
      Runtime: python3.9
      Handler: index.lambda_handler # Assuming main Python file is index.py
      Role: !GetAtt IAMRoleHVACLambda.Arn
      Code:
        S3Bucket: !Sub hvac-optimizer-code-\${EnvironmentName} # Bucket for Lambda deployment packages
        S3Key: control_algorithm_latest.zip # Deployment package key
      Timeout: 60 # seconds
      MemorySize: !Ref LambdaMemorySizeMB
      Environment:
        Variables:
          CONFIG_S3_BUCKET: !Sub hvac-optimizer-configs-\${EnvironmentName}
          ALGO_PARAMS_S3_KEY: 'current_algo_params.json'
          LOG_LEVEL: 'INFO'

Outputs:
  HVACDataBucketName:
    Description: Name of the S3 bucket for HVAC data.
    Value: !Ref HVACDataBucket
  ControlLambdaFunctionArn:
    Description: ARN of the HVAC control Lambda function.
    Value: !GetAtt HVACControlLambdaFunction.Arn
`;

export default function ConfigManagerPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Settings className="mr-2 h-6 w-6 text-primary"/>AWS Configuration Manager</CardTitle>
          <CardDescription>Manage algorithm parameters, AWS resource configurations (CloudFormation, IAM), and deployment settings. Configurations are version-controlled with Git.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
            <Button variant="default"><Save className="mr-2 h-4 w-4" /> Save All Configurations</Button>
            <Button variant="outline"><Rocket className="mr-2 h-4 w-4" /> Deploy Changes (CI/CD)</Button>
            <Button variant="ghost" size="sm"><GitMerge className="mr-2 h-4 w-4" /> Git: main</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="algoParams" className="flex-grow flex flex-col min-h-0">
        <TabsList className="mb-2 self-start">
          <TabsTrigger value="algoParams"><FileJson className="mr-2 h-4 w-4"/> Algorithm Parameters</TabsTrigger>
          <TabsTrigger value="cloudformation"><FileText className="mr-2 h-4 w-4"/> CloudFormation Stack</TabsTrigger>
          <TabsTrigger value="iamConfig"><ShieldCheck className="mr-2 h-4 w-4"/> IAM & Security</TabsTrigger>
          <TabsTrigger value="secrets"><KeyRound className="mr-2 h-4 w-4"/> Secrets Management</TabsTrigger>
        </TabsList>

        <TabsContent value="algoParams" className="flex-grow">
          <Card className="h-full flex flex-col shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Algorithm Parameters (parameters.json)</CardTitle>
              <CardDescription>Define and manage parameters for control algorithms. UI forms can be (conceptually) generated from a JSON schema for easier editing.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow min-h-0">
              <CodeEditorPlaceholder title="parameters.json (S3: s3://hvac-configs-prod/current_algo_params.json)" defaultCode={exampleAlgoParamsJson} language="json" />
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">Parameters are typically stored in S3 and loaded by Lambda functions during runtime.</p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="cloudformation" className="flex-grow">
          <Card className="h-full flex flex-col shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">CloudFormation Template (hvac_stack.yaml)</CardTitle>
              <CardDescription>Edit and manage AWS CloudFormation templates (YAML/JSON) for your HVAC Optimizer infrastructure.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow min-h-0">
              <CodeEditorPlaceholder title="hvac_optimizer_stack.yaml" defaultCode={exampleCloudFormationYaml} language="yaml" />
            </CardContent>
             <CardFooter className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Track infrastructure as code. Deployments trigger CloudFormation stack updates.</p>
                <Button><UploadCloud className="mr-2 h-4 w-4" /> Validate & Deploy Stack</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="iamConfig" className="flex-grow">
          <Card className="h-full flex flex-col shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">IAM Roles & Security Policies</CardTitle>
              <CardDescription>Configure IAM roles, policies, and S3 bucket security settings. Ensure least privilege access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-auto">
              <div>
                <Label htmlFor="lambdaRoleArn">Lambda Execution Role ARN</Label>
                <Input id="lambdaRoleArn" placeholder="arn:aws:iam::123456789012:role/HvacOptimizerLambdaRole-production" defaultValue="arn:aws:iam::123456789012:role/HvacOptimizerLambdaRole-production" />
              </div>
              <div>
                <Label htmlFor="s3BucketPolicy">S3 Bucket Policy (hvac-optimizer-data-raw-production)</Label>
                 <Textarea id="s3BucketPolicy" placeholder='{ "Version": "2012-10-17", "Statement": [...] }' rows={6} className="font-mono text-xs" defaultValue='{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": {\n        "Service": "lambda.amazonaws.com"\n      },\n      "Action": "s3:GetObject",\n      "Resource": "arn:aws:s3:::hvac-optimizer-data-raw-production/*"\n    }\n  ]\n}' />
              </div>
               <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Apply Security Settings</Button>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Changes to IAM policies and S3 configurations should be carefully reviewed and tested.</p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="secrets" className="flex-grow">
          <Card className="h-full flex flex-col shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Secrets Management</CardTitle>
              <CardDescription>Manage API keys and sensitive credentials using AWS Secrets Manager (conceptual).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This section would provide an interface to list, add, or update secrets stored in AWS Secrets Manager.
                For example, API keys for third-party weather services or database credentials.
              </p>
              <div className="border p-4 rounded-md bg-muted/50">
                <Label htmlFor="secretName">Secret Name</Label>
                <Input id="secretName" placeholder="e.g., /hvac/api/weather_service_key" className="mb-2"/>
                <Label htmlFor="secretValue">Secret Value</Label>
                <Input id="secretValue" type="password" placeholder="Enter new secret value (if updating)" />
                <Button variant="outline" className="mt-2"><Save className="mr-2 h-4 w-4"/> Save Secret</Button>
              </div>
               <p className="text-xs text-muted-foreground">Actual integration with AWS Secrets Manager backend needed.</p>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Ensure secrets are rotated regularly and access is restricted.</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
