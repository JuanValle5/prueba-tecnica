#!/usr/bin/env bash
set -e

STACK_NAME="fixlat-portal-stack"
REGION="${AWS_REGION:-us-east-1}"
ENV_NAME="${ENVIRONMENT:-prod}"

echo "============================================================"
echo "   FIXLAT PORTAL - Despliegue en AWS (SAM & CloudFormation)  "
echo "============================================================"
echo "Stack:       ${STACK_NAME}"
echo "Región:      ${REGION}"
echo "Entorno:     ${ENV_NAME}"
echo "------------------------------------------------------------"

# 1. Compilar y empaquetar con AWS SAM
echo ">>> [1/4] Compilando recursos con AWS SAM..."
sam build -t template.yaml

# 2. Desplegar la infraestructura con CloudFormation
echo ">>> [2/4] Desplegando stack con AWS SAM..."
sam deploy \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --resolve-s3 \
  --no-confirm-changeset

# 3. Obtener outputs
echo ">>> [3/4] Obteniendo salidas de la infraestructura..."
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendS3BucketName'].OutputValue" \
  --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendCloudFrontURL'].OutputValue" \
  --output text)

BACKEND_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='BackendAPIEndpoint'].OutputValue" \
  --output text)

LAMBDA_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='LambdaMetricsEndpoint'].OutputValue" \
  --output text)

# 4. Compilar y sincronizar frontend hacia S3
echo ">>> [4/4] Desplegando frontend a S3 (${S3_BUCKET})..."
cd ../frontend
npm install
npm run build
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete
cd ../aws

echo "============================================================"
echo "   ¡DESPLIEGUE EXITOSO! URLs DE ACCESO:                     "
echo "============================================================"
echo "Frontend (CloudFront CDN): ${CLOUDFRONT_URL}"
echo "Backend API (EC2 Docker):  ${BACKEND_URL}"
echo "Lambda Metrics (Serverless): ${LAMBDA_URL}"
echo "============================================================"
