# AWS Lambda container image for the ATS scorer.
#
# Build:
#   docker build -t ats-scorer .
#
# Test locally (Lambda RIE):
#   docker run -p 9000:8080 ats-scorer
#   curl -X POST http://localhost:9000/2015-03-31/functions/function/invocations \
#        -d '{"httpMethod":"POST","path":"/api/ats-score","body":"{\"resume\":{},\"jdText\":\"\"}"}'
#
# Push to ECR and deploy via SAM / CDK / console.

FROM public.ecr.aws/lambda/python:3.12

WORKDIR ${LAMBDA_TASK_ROOT}

# Install Python deps first (layer-friendly caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the spaCy model into the image — no download on cold start
RUN python -m spacy download en_core_web_sm

# Bake the sentence-transformer model into the image (~90 MB on disk)
# SENTENCE_TRANSFORMERS_HOME controls the cache path inside the container
ENV SENTENCE_TRANSFORMERS_HOME=/opt/st_cache
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy service source
COPY . ${LAMBDA_TASK_ROOT}/services/ats_scorer/

# Lambda invokes this module-level 'handler' attribute
CMD ["services.ats_scorer.lambda_handler.handler"]
