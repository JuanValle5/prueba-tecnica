#!/usr/bin/env bash
set -e

STACK_NAME="fixlat-portal-stack"
REGION="${AWS_REGION:-us-east-1}"

echo "============================================================"
echo "   FIXLAT PORTAL - Retirada de Recursos en AWS (Limpieza)    "
echo "============================================================"

# 1. Vaciar Bucket S3 si existe
echo ">>> [1/2] Vaciando bucket S3 del frontend..."
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendS3BucketName'].OutputValue" \
  --output text 2>/dev/null || true)

if [ -n "${S3_BUCKET}" ] && [ "${S3_BUCKET}" != "None" ]; then
  echo "Vaciando contenido de s3://${S3_BUCKET}..."
  aws s3 rm "s3://${S3_BUCKET}" --recursive || true
fi

# 2. Eliminar Stack CloudFormation mediante SAM
echo ">>> [2/2] Eliminando stack de CloudFormation..."
sam delete \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --no-prompts

echo "============================================================"
echo "   ¡Recursos de AWS eliminados exitosamente!                 "
echo "============================================================"
