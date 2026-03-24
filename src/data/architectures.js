export const architectures = {
  /* ================================================================
     1. EXTENDED WEB APPLICATION
  ================================================================ */
  webapp: {
    id: 'webapp',
    name: 'Web App Backend Architecture',
    regions: [
      { id: 'r1', label: 'Edge Network',      left:'15%', top:'18%', width:'15%', height:'64%' },
      { id: 'r2', label: 'Application Core',  left:'35%', top:'13%', width:'40%', height:'76%' },
      { id: 'r3', label: 'Persistence Layer', left:'82%', top:'13%', width:'14%', height:'76%' },
    ],
    nodes: {
      client:    { id:'client',    icon:'monitor',       label:'Client Browser',   left:'6%',    top:'50%', title:'Client Browser Environment',
        descBeginner:'Your laptop or phone. It securely packages your action, signs it with your ID token, and fires it at the server.',
        descPro:'DOM execution context compiling user gestures into a JSON payload, injecting an OAuth2 Bearer token, initiating a TLS 1.3 handshake over TCP.',
        details:['TLS 1.3 Handshake','JWT Token Injection','JSON Serialization'],
        pseudoCode:`// Browser fetch with JWT auth
async function sendRequest(endpoint, body) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}`,
        pseudoCodePython:`# Python requests with JWT auth
import requests, json

def send_request(endpoint, body, token):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.post(
        endpoint, 
        data=json.dumps(body), 
        headers=headers
    )
    response.raise_for_status()
    return response.json()` },

      cdn:       { id:'cdn',       icon:'globe',         label:'Edge CDN',         left:'22%',   top:'28%', title:'Content Delivery Network',
        descBeginner:'A worldwide network of servers that stores your website files close to you so pages load in milliseconds instead of seconds.',
        descPro:'Geo-distributed PoP nodes (Cloudflare/Fastly) serving static assets from RAM, performing cache-control validation, forwarding cache-miss requests to origin.',
        details:['Geo-Routing PoP','Static Asset Caching','Cache-Control Validation'],
        pseudoCode:`// Cloudflare Worker — cache-first strategy
export default {
  async fetch(request) {
    const cache = caches.default;
    let res = await cache.match(request);
    if (res) return res; // Cache HIT
    res = await fetch(request);  // Miss → origin
    const cloned = res.clone();
    event.waitUntil(cache.put(request, cloned));
    return res;
  }
}`,
        pseudoCodePython:`# Python Edge Cache (pseudo-code)
def handle_request(request):
    # Check local high-speed RAM cache
    cached_res = edge_cache.get(request.url)
    if cached_res:
        return cached_res # Cache HIT
        
    # Cache MISS -> Fetch from Origin
    response = origin_server.fetch(request)
    
    # Store in edge cache for next time
    edge_cache.set(request.url, response, ttl=3600)
    return response` },

      waf:       { id:'waf',       icon:'shield',        label:'Edge Firewall',    left:'22%',   top:'50%', title:'Web Application Firewall',
        descBeginner:'The club bouncer. Scans every single incoming network packet for hacking attempts, floods, or suspicious patterns before anything enters the system.',
        descPro:'Stateful L7 packet inspector evaluating each HTTP request against CVE signature databases, rate-limiting abusive CIDRs, dropping SQLi/XSS payloads.',
        details:['CVE Signature Matching','DDoS Rate Limiting','SQLi / XSS Scrubbing'],
        pseudoCode:`// WAF rule evaluation middleware
function wafMiddleware(req, res, next) {
  const ip = req.ip;
  if (rateLimiter.isBlocked(ip)) {
    return res.status(429).send('Too Many Requests');
  }
  const body = JSON.stringify(req.body);
  if (sqliPattern.test(body) || xssPattern.test(body)) {
    log.warn('Malicious payload blocked', { ip });
    return res.status(403).send('Forbidden');
  }
  rateLimiter.increment(ip);
  next();
}`,
        pseudoCodePython:`# Python Flask WAF Middleware
from flask import request, abort

def waf_check():
    ip = request.remote_addr
    if rate_limiter.is_blocked(ip):
        abort(429, "Too Many Requests")
        
    payload = request.get_data(as_text=True)
    if contains_sqli(payload) or contains_xss(payload):
        logger.warning(f"Blocked malicious IP: {ip}")
        abort(403, "Forbidden")
        
    rate_limiter.increment(ip)` },

      gateway:   { id:'gateway',   icon:'router',        label:'API Gateway',      left:'22%',   top:'72%', title:'API Gateway — Reverse Proxy',
        descBeginner:'The traffic cop. Reads the address on your request, routes it to the correct internal service, and balances load across multiple servers.',
        descPro:'Ingress controller (Envoy/Kong) performing L7 path-based routing, SSL termination, service discovery via DNS mesh, and upstream connection pooling.',
        details:['L7 Route Resolution','SSL Termination','Upstream Pool Management'],
        pseudoCode:`# Kong / Envoy route config (YAML)
services:
  - name: auth-service
    url: http://auth-svc:3001
    routes:
      - paths: ['/api/auth']
  - name: domain-service
    url: http://biz-svc:3002
    routes:
      - paths: ['/api/data']
plugins:
  - name: rate-limiting
    config: { minute: 1000 }
  - name: jwt`,
        pseudoCodePython:`# Python API Gateway Logic (FastAPI/Traefik)
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def dispatch_request(request: Request, call_next):
    path = request.url.path
    # Path-based routing logic
    if path.startswith("/api/auth"):
        target = "http://auth-service:8080"
    elif path.startswith("/api/data"):
        target = "http://biz-service:8080"
    
    return await proxy_to(target, request)` },

      ssr:       { id:'ssr',       icon:'server',        label:'SSR Node',         left:'42%',   top:'33%', title:'Server-Side Rendering Layer',
        descBeginner:'A server that pre-bakes the web page so your browser receives finished HTML instead of a blank shell — pages feel instant.',
        descPro:'Node.js V8 runtime executing Next.js `getServerSideProps` or Nuxt SSR lifecycle, hydrating the React/Vue component tree into serialised HTML before transmission.',
        details:['V8 Runtime Execution','React/Vue Hydration','HTML Serialisation'],
        pseudoCode:`// Next.js SSR page handler
export async function getServerSideProps(ctx) {
  const token = ctx.req.cookies.token;
  const user = await verifyJWT(token);
  if (!user) return { redirect: { destination: '/login' } };
  const data = await fetchFromCache(user.id)
    || await db.query('SELECT * FROM items WHERE uid=$1', [user.id]);
  return { props: { data, user } };
}`,
        pseudoCodePython:`# Python Django/Flask SSR logic
def render_profile_page(request):
    token = request.cookies.get('token')
    user = auth_service.verify_jwt(token)
    if not user:
        return redirect('/login')
        
    # Data pre-fetching
    data = cache.get(f"user:{user.id}")
    if not data:
        data = db.fetch_user_items(user.id)
        
    return render_template('profile.html', user=user, items=data)` },

      auth:      { id:'auth',      icon:'key',           label:'Identity Provider', left:'42%',  top:'60%', title:'Authentication Service',
        descBeginner:'The security guard that checks your digital ID badge. It verifies the badge is genuine, not expired, and that you have permission for what you are asking to do.',
        descPro:'IAM service cryptographically verifying the JWT RS256 signature via JWKS public keys, validating `exp`/`iat` epoch claims, evaluating RBAC scope grants.',
        details:['RS256 JWT Verification','RBAC Scope Evaluation','Token Expiry Validation'],
        pseudoCode:`// JWT verification middleware
async function verifyAuth(req, res, next) {
  const [, token] = req.headers.authorization?.split(' ') ?? [];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const jwks = await fetchJWKS(process.env.JWKS_URI);
    const payload = jwt.verify(token, jwks, { algorithms: ['RS256'] });
    if (!payload.scope.includes(req.requiredScope))
      return res.status(403).json({ error: 'Forbidden' });
    req.user = payload;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}`,
        pseudoCodePython:`# Python JWT Verification (PyJWT)
import jwt

def verify_token(headers, required_scope):
    auth_header = headers.get('Authorization')
    if not auth_header:
        raise AuthError(401, "Missing token")
        
    token = auth_header.split(" ")[1]
    try:
        # Verify against public keys (JWKS)
        payload = jwt.decode(token, public_key, algorithms=["RS256"])
        if required_scope not in payload.get('scope', []):
            raise AuthError(403, "Insufficient scope")
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthError(401, "Token expired")` },

      cache:     { id:'cache',     icon:'zap',           label:'Redis Cache',      left:'55%',   top:'20%', title:'In-Memory Cache Layer',
        descBeginner:'The short-term memory. If you asked the same question recently, the answer is already here — served in under a millisecond without touching any database.',
        descPro:'Single-threaded Redis key-value store backed entirely by volatile RAM. Performs O(1) hash-table lookups, applies TTL expiry, evicts entries via an LRU algorithm.',
        details:['O(1) Hash-Table Lookup','TTL Key Expiration','LRU Memory Eviction'],
        pseudoCode:`// Cache-aside pattern with Redis
async function getWithCache(key, fetchFn, ttlSeconds = 300) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached); // Cache HIT
  const fresh = await fetchFn();         // Cache MISS
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}
// Usage
const user = await getWithCache(
  'user:' + userId,
  () => db.findUser(userId)
);`,
        pseudoCodePython:`# Python Redis (redis-py)
import redis, json

r = redis.Redis(host='localhost', port=6379)

def get_user_data(user_id):
    key = f"user:{user_id}"
    cached = r.get(key)
    if cached:
        return json.loads(cached) # Cache HIT
        
    # MISS -> fetch from slow DB
    data = db.query_user(user_id)
    r.setex(key, 300, json.dumps(data))
    return data` },

      validator: { id:'validator', icon:'check-circle',  label:'Request Validator', left:'55%',  top:'52%', title:'Payload Schema Validator',
        descBeginner:'The customs inspector. Verifies the exact shape of the data package — correct types, correct fields, nothing missing — and rejects anything malformed immediately.',
        descPro:'Applies strict OpenAPI 3.0 / JSON Schema validation. Enforces property types, maxLength, required fields, and maximum object depth to prevent memory-exhaustion payloads.',
        details:['OpenAPI Schema Enforcement','Deep Nesting Bounds','400 Bad Request Rejection'],
        pseudoCode:`// Zod schema validation middleware
import { z } from 'zod';
const schema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().max(100000),
  items:  z.array(z.string()).max(50)
});
function validate(req, res, next) {
  const result = schema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ errors: result.error.flatten() });
  req.body = result.data; // sanitised
  next();
}`,
        pseudoCodePython:`# Python Pydantic Validation
from pydantic import BaseModel, Field
from uuid import UUID
from typing import List

class RequestSchema(BaseModel):
    userId: UUID
    amount: float = Field(gt=0, le=100000)
    items:  List[str] = Field(max_items=50)

def validate_request(data):
    try:
        # Validates and sanitizes
        return RequestSchema(**data)
    except ValidationError as e:
        return {"error": e.json()}, 400` },

      biz:       { id:'biz',       icon:'cpu',           label:'Domain Service',   left:'68%',   top:'52%', title:'Core Business Logic Engine',
        descBeginner:'The brain. This is where the actual app rules live — calculating totals, applying discounts, deciding what the correct response should look like.',
        descPro:'Stateless pure-function worker implementing domain aggregates and business invariants. Reads clean sanitised DTOs, mutates state, emits domain events.',
        details:['Domain Aggregate Mutation','Pure Function Execution','Domain Event Emission'],
        pseudoCode:`// Domain service — pure business logic
class OrderService {
  async processOrder(dto) {
    const inventory = await inventoryRepo.get(dto.itemId);
    if (inventory.stock < dto.qty)
      throw new DomainError('INSUFFICIENT_STOCK');
    const total = dto.qty * inventory.price;
    const discount = applyDiscountRules(dto.userId, total);
    const order = Order.create({ ...dto, total: total - discount });
    eventBus.emit('order.created', order);
    return order;
  }
}`,
        pseudoCodePython:`# Python Domain Service (Business Logic)
class OrderService:
    def process_order(self, data):
        inventory = inventory_repo.get(data['item_id'])
        if inventory.stock < data['qty']:
            raise ValueError("Insufficient stock")
            
        total = data['qty'] * inventory.price
        discount = calculate_discount(data['user_id'], total)
        
        # Pure business logic mutation
        final_price = total - discount
        event_bus.publish("order.created", {"user_id": data['user_id'], "price": final_price})
        return {"status": "success", "total": final_price}` },

      saga:      { id:'saga',      icon:'git-merge',     label:'Transaction Saga', left:'68%',   top:'78%', title:'Distributed Saga Orchestrator',
        descBeginner:'The warehouse foreman. Safely coordinates writing data to multiple separate databases at once. If one write fails, it rolls back all the others so nothing is half-saved.',
        descPro:'Saga pattern coordinator issuing compensating transactions across bounded contexts. Manages two-phase commit (2PC) sequences with explicit rollback on partial failures.',
        details:['Two-Phase Commit (2PC)','Compensating Transactions','Rollback Coordination'],
        pseudoCode:`// Saga orchestrator with compensating txn
async function runOrderSaga(order) {
  const steps = [];
  try {
    await db.beginTransaction();
    steps.push(() => db.rollbackOrder(order.id));
    await db.insertOrder(order);
    await warehouse.reserveStock(order.itemId, order.qty);
    steps.push(() => warehouse.releaseStock(order.itemId, order.qty));
    await db.commit();
  } catch (err) {
    for (const compensate of steps.reverse())
      await compensate(); // rollback each step
    throw err;
  }
}`,
        pseudoCodePython:`# Python Saga Orchestrator
def run_order_saga(order_data):
    compensations = []
    try:
        # Step 1: Charge customer
        payment.charge(order_data['user_id'], order_data['total'])
        compensations.append(lambda: payment.refund(order_data['user_id']))
        
        # Step 2: Reserve stock
        inventory.reserve(order_data['sku'], order_data['qty'])
        compensations.append(lambda: inventory.unreserve(order_data['sku']))
        
        # Step 3: Create Order record
        db.create_order(order_data)
    except Exception as e:
        # Rollback all previous successful steps
        for undo in reversed(compensations):
            undo()
        raise e` },

      db:        { id:'db',        icon:'database',      label:'Primary OLTP DB',  left:'89%',   top:'35%', title:'ACID Relational Database',
        descBeginner:'The main filing cabinet — the single authoritative record of all user data. Every account, every transaction is stored here with absolute reliability.',
        descPro:'PostgreSQL cluster with synchronous replication. WAL-logged B-Tree indexes support row-level locking for high-throughput OLTP at thousands of transactions per second.',
        details:['Write-Ahead Log (WAL)','B-Tree Row-Level Locking','Synchronous Replication'],
        pseudoCode:`-- PostgreSQL: ACID insert with row lock
BEGIN;
SELECT id FROM orders
  WHERE id = $1 FOR UPDATE; -- row-level lock
INSERT INTO transactions (order_id, amount, status)
  VALUES ($1, $2, 'COMPLETED');
UPDATE orders SET status = 'PAID' WHERE id = $1;
COMMIT; -- WAL flushed, replica synced`,
        pseudoCodePython:`# Python SQLAlchemy with Row Locking
from sqlalchemy.orm import Session

def process_payment(db: Session, order_id: int):
    # 'with_for_update' translates to SELECT ... FOR UPDATE
    order = db.query(Order).filter_by(id=order_id).with_for_update().one()
    
    transaction = Transaction(order_id=order_id, status='PAID')
    db.add(transaction)
    order.status = 'PAID'
    
    # DB handles the COMMIT/ROLLBACK logic
    db.commit()` },

      warehouse: { id:'warehouse', icon:'layers',        label:'Analytical Warehouse', left:'89%', top:'72%', title:'OLAP Data Warehouse',
        descBeginner:'The massive historical archive. Analysts run huge company-wide queries here (e.g. "revenue this year") without ever slowing down the live database.',
        descPro:'Columnar storage engine (Snowflake/BigQuery) with decoupled compute clusters. Resolves petabyte MPP aggregation queries via vectorised columnar scans isolated from OLTP.',
        details:['Columnar Storage','MPP Distributed Queries','Compute-Storage Decoupling'],
        pseudoCode:`-- Snowflake MPP aggregation query
SELECT
  DATE_TRUNC('month', created_at) AS month,
  product_category,
  SUM(revenue)                   AS total_revenue,
  COUNT(DISTINCT user_id)        AS unique_buyers
FROM fact_orders
WHERE created_at >= DATEADD(year, -1, CURRENT_DATE)
GROUP BY 1, 2
ORDER BY 1, 3 DESC;`,
        pseudoCodePython:`# Python SQL Alchemy / Pandas Aggregation
import pandas as pd

def get_revenue_report(engine):
    query = """
    SELECT created_at, category, revenue, user_id 
    FROM fact_orders 
    WHERE created_at > now() - interval '1 year'
    """
    df = pd.read_sql(query, engine)
    
    # Python-side aggregation (for small/med data)
    return df.groupby('category').agg({
        'revenue': 'sum',
        'user_id': 'nunique'
    }).sort_values('revenue', ascending=False)` },
    },
    lines:[
      {id:'w1',from:'client',to:'cdn'},    {id:'w2',from:'client',to:'waf'},
      {id:'w13',from:'cdn',to:'waf'},
      {id:'w3',from:'waf',to:'gateway'},    {id:'w4',from:'gateway',to:'ssr'},
      {id:'w5',from:'gateway',to:'auth'},   {id:'w6',from:'ssr',to:'cache'},
      {id:'w7',from:'auth',to:'validator'}, {id:'w8',from:'validator',to:'biz'},
      {id:'w9',from:'biz',to:'cache'},      {id:'w10',from:'biz',to:'saga'},
      {id:'w11',from:'saga',to:'db'},       {id:'w12',from:'saga',to:'warehouse'},
    ],
    simulate:[
      {from:'client',to:'waf',  type:'request', dur:500, logBeginner:'Browser encrypts the request and sends it to the cloud.',logPro:'TLS 1.3 handshake initiated — ClientHello dispatched.'},
      {node:'waf',  process:true, dur:350, logBeginner:'Firewall scanning for attacks.',logPro:'WAF evaluating CVE heuristics and DDoS thresholds.'},
      {from:'waf',  to:'gateway',type:'request',dur:400, logBeginner:'Packet approved — routing to API Gateway.',logPro:'Packet passed L7 inspection — forwarded to ingress controller.'},
      {from:'gateway',to:'ssr', type:'request',dur:400, logBeginner:'Gateway forwards page request to SSR.',logPro:'Ingress routing /page path to SSR upstream pool.'},
      {node:'ssr',  process:true, dur:400, logBeginner:'Server pre-builds the HTML page.',logPro:'Next.js SSR lifecycle hydrating React tree into serialised HTML.'},
      {from:'ssr',  to:'cache', type:'background',dur:500},
      {from:'gateway',to:'auth',type:'request',dur:400, logBeginner:'Gateway checks your ID badge.',logPro:'Forwarding Bearer token to IAM service for RS256 verification.'},
      {node:'auth', process:true, dur:400, logBeginner:'Auth verifying your token.',logPro:'JWKS public-key validation + RBAC scope evaluation.'},
      {from:'auth', to:'validator',type:'request',dur:400, logBeginner:'Identity confirmed — validating data shape.',logPro:'Passing clean identity context to JSON Schema validator.'},
      {node:'validator',process:true,dur:300, logBeginner:'Checking data types and fields.',logPro:'OpenAPI schema enforcing required fields and type constraints.'},
      {from:'validator',to:'biz',type:'request',dur:400, logBeginner:'Validated payload enters the business logic engine.',logPro:'Sanitised DTO dispatched to domain service worker.'},
      {node:'biz',  process:true, dur:500, logBeginner:'App calculates totals and rules.',logPro:'Domain aggregate applying business invariants and emitting events.'},
      {from:'biz',  to:'cache', type:'background',dur:600, logBeginner:'New answer saved to fast memory.',logPro:'Async daemon upserting result into Redis with new TTL.'},
      {from:'biz',  to:'saga',  type:'request', dur:400, logBeginner:'Sending data to the storage foreman.',logPro:'Domain events dispatched to Saga orchestrator for commit.'},
      {node:'saga', process:true, dur:400, logBeginner:'Foreman sets up safe database writes.',logPro:'Saga opening distributed transaction scope with 2PC prepare phase.'},
      {from:'saga', to:'db',    type:'request', dur:600, logBeginner:'Writing to the main filing cabinet.',logPro:'Issuing ACID B-Tree INSERT with row-level locking.'},
      {from:'db',   to:'saga',  type:'response',dur:400, logBeginner:'Database confirmed the save.',logPro:'WAL commit ACK returned — row durably persisted.'},
      {from:'saga', to:'warehouse',type:'background',dur:700, logBeginner:'Backup copy sent to the analytics archive.',logPro:'ETL stream pushing state delta to Snowflake columnar cluster.'},
      {from:'saga', to:'biz',   type:'response',dur:300},
      {from:'biz',  to:'gateway',type:'response',dur:400},
      {from:'gateway',to:'cdn', type:'response',dur:400, logBeginner:'Response cached at edge for next visitors.',logPro:'Cache-Control headers set — CDN PoP priming asset.'},
      {from:'cdn',  to:'client',type:'response',dur:500, logBeginner:'Page delivered instantly!',logPro:'Serialised HTML delivered; client DOM hydrates React tree.'},
    ],
  },

  /* ================================================================
     2. AI / ML WORKFLOW
  ================================================================ */
  ai:{
    id:'ai',
    name: 'AI / Machine Learning Architecture',
    regions:[
      {id:'ra1',label:'Data Preparation',  left:'19%',top:'14%',width:'22%',height:'74%'},
      {id:'ra2',label:'Model Computing',   left:'47%',top:'14%',width:'21%',height:'74%'},
      {id:'ra3',label:'Edge Inference',    left:'74%',top:'18%',width:'16%',height:'62%'},
    ],
    nodes:{
      raw:     {id:'raw',    icon:'database',   label:'Raw Dataset Store', left:'7%', top:'28%', title:'Cold Data Lake',
        descBeginner:'A giant digital dumping ground. Every log, image, and sensor reading is piled here in raw form with zero organisation.',
        descPro:'Petabyte-scale cold object store (AWS S3 / GCS). Stores unstructured blobs, uncompressed CSVs, and media files with Schema-on-Read — no structure enforced at write time.',
        details:['S3 Object Storage','Schema-on-Read','Petabyte-Scale'],
        pseudoCode:`// Upload raw data (Node.js AWS SDK v3)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';

const s3 = new S3Client({});
const fileStream = fs.createReadStream('sensor_log.csv');
await s3.send(new PutObjectCommand({
  Bucket: 'raw-data-lake',
  Key: 'sensors/2024/sensor_log.csv',
  Body: fileStream
}));`,
        pseudoCodePython:`# Upload raw data to S3 (Python boto3)
import boto3
s3 = boto3.client('s3')
# Stream a large CSV without loading into RAM
with open('sensor_log.csv', 'rb') as f:
    s3.upload_fileobj(
        f,
        Bucket='raw-data-lake',
        Key='sensors/2024/sensor_log.csv'
    )
print('Raw artifact uploaded.')` },

      query:   {id:'query',  icon:'smartphone', label:'Client Inference',  left:'7%', top:'72%', title:'End-User Inference Client',
        descBeginner:'A user typing a question into a chatbot or uploading a photo for the AI to analyse.',
        descPro:'HTTP/gRPC client serialising inputs into tokenised tensor payloads, attaching auth headers, dispatching to the inference API endpoint.',
        details:['Inference API Call','Tokenised Input','gRPC Streaming'],
        pseudoCode:`// Client sending a prompt (JavaScript Fetch)
async function sendPrompt(promptText) {
  const res = await fetch('/api/infer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, max_tokens: 512 })
  });
  // handle streaming response
  const reader = res.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    renderToken(new TextDecoder().decode(value));
  }
}`,
        pseudoCodePython:`# Client inference (Python Requests)
import requests, json

def get_answer(prompt):
    url = "https://api.ai-service.com/v1/infer"
    payload = {
        "prompt": prompt,
        "temperature": 0.7,
        "stream": False
    }
    response = requests.post(url, json=payload)
    return response.json()['choices'][0]['text']` },

      ingest:  {id:'ingest', icon:'download',   label:'Data Pipeline',     left:'30%',top:'28%', title:'ETL Ingestion Workers',
        descBeginner:'Robo-cleaners. They vacuum up all the raw messy data, scrub out corrupted rows, and format everything neatly so the AI can understand it.',
        descPro:'Distributed Spark/Flink ETL jobs performing missing-value imputation, feature normalisation (z-score/min-max), data-type casting, and tensor serialisation.',
        details:['Missing-Value Imputation','Feature Normalisation','Tensor Serialisation'],
        pseudoCode:`// Node.js CSV cleaning (fast-csv)
import * as csv from 'fast-csv';
import fs from 'fs';

fs.createReadStream('sensors.csv')
  .pipe(csv.parse({ headers: true }))
  .transform(row => ({
    ...row,
    value_norm: (row.value - min) / (max - min)
  }))
  .pipe(csv.format({ headers: true }))
  .pipe(fs.createWriteStream('clean_sensors.csv'));`,
        pseudoCodePython:`# PySpark ETL normalisation
from pyspark.sql import functions as F
df = spark.read.parquet('s3://raw-data-lake/sensors/')
# Drop nulls, normalise between 0-1
df = df.dropna(subset=['value'])
min_v, max_v = df.agg(F.min('value'), F.max('value')).first()
df = df.withColumn('value_norm',
  (F.col('value') - min_v) / (max_v - min_v)
)
df.write.parquet('s3://feature-store/clean/')` },

      feature: {id:'feature',icon:'component',  label:'Feature Store',     left:'30%',top:'72%', title:'ML Feature Store',
        descBeginner:'A perfectly organised pantry of AI ingredients. Every number the model needs is already chopped, measured, and labelled so training starts instantly.',
        descPro:'Centralised low-latency feature repository (Feast/Tecton) synchronising offline batch embeddings with online serving vectors, ensuring training-serving skew is zero.',
        details:['Offline/Online Parity','Vector Embedding Store','Feature Versioning'],
        pseudoCode:`// Node.js Feature retrieval (pseudo-code)
import { FeatureStore } from '@features/sdk';
const store = new FeatureStore('prod-registry');

async function getFeatures(userId) {
  // Low-latency vector retrieval
  return await store.getOnlineFeatures({
    features: ['user:avg_spend', 'user:last_login'],
    entities: { user_id: userId }
  });
}`,
        pseudoCodePython:`# Feast feature store — define + serve
from feast import FeatureStore
store = FeatureStore(repo_path='.')
# Offline: materialise for training
store.materialize_incremental(end_date=datetime.now())
# Online: retrieve at inference time
features = store.get_online_features(
  features=['user_stats:avg_session','user_stats:total_spend'],
  entity_rows=[{'user_id': uid}]
).to_dict()` },

      gpu:     {id:'gpu',    icon:'hard-drive',  label:'GPU Training Cluster',left:'57%',top:'28%', title:'HPC GPU Training Farm',
        descBeginner:'Thousands of ultra-fast calculators working together for days to teach the AI how to recognise patterns in the training data.',
        descPro:'Multi-node A100/H100 HPC cluster executing distributed backpropagation via gradient descent. Frameworks (PyTorch DDP / Horovod) synchronise gradients across GPUs via NCCL.',
        details:['Gradient Descent Backprop','NCCL All-Reduce Sync','Hyperparameter Search'],
        pseudoCode:`// TensorFlow.js distributed training
import * as tf from '@tensorflow/tfjs-node-gpu';

const model = tf.sequential({
  layers: [tf.layers.dense({ units: 128, inputShape: [784] })]
});
model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });

// Distributed training via Node.js cluster
await model.fit(dataset, {
  epochs: 10,
  callbacks: { onEpochEnd: (e, logs) => console.log(logs.loss) }
});`,
        pseudoCodePython:`# PyTorch distributed training (DDP)
import torch
import torch.nn as nn
from torch.nn.parallel import DistributedDataParallel as DDP
model = MyTransformerModel().cuda()
model = DDP(model, device_ids=[local_rank])
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)
for epoch in range(100):
    for batch in dataloader:
        loss = model(batch).loss
        loss.backward()   # backprop gradients
        optimizer.step()  # update weights
        optimizer.zero_grad()` },

      registry:{id:'registry',icon:'archive',   label:'Model Registry',    left:'57%',top:'72%', title:'ML Artifact Registry',
        descBeginner:'The graduation vault. Once the AI passes its accuracy tests, its exact brain state is packaged and saved here safely for deployment.',
        descPro:'MLflow / Weights & Biases model store versioning serialised weight files (.pt / .onnx), metadata, benchmark F1 scores, and staged promotion gates.',
        details:['Weight File Versioning','Benchmark Metadata','Promotion Staging Gates'],
        pseudoCode:`// MLflow Node.js client (pseudo-code)
import { MlflowClient } from 'mlflow-node';
const client = new MlflowClient('https://mlflow.internal');

async function stageModel(name, version) {
  await client.transitionModelVersionStage({
    name, version,
    stage: 'Production',
    archive_existing_versions: true
  });
}`,
        pseudoCodePython:`# MLflow — log and register model
import mlflow
import mlflow.pytorch
with mlflow.start_run():
    mlflow.log_param('lr', 3e-4)
    mlflow.log_metric('f1', val_f1)
    mlflow.pytorch.log_model(model, 'model')
# Promote to Production stage
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name='TransformerV2',
    version=3,
    stage='Production'
)` },

      serving: {id:'serving',icon:'activity',   label:'Inference Serving', left:'82%',top:'42%', title:'LLM / CV Inference API',
        descBeginner:'The live AI brain on 24/7 duty. It listens for user prompts and generates answers in real time using its trained knowledge.',
        descPro:'Triton Inference Server / vLLM loading model weights into GPU VRAM, executing optimised CUDA forward-passes, returning token streams via batched HTTP/gRPC responses.',
        details:['CUDA Forward-Pass','GPU VRAM Weight Loading','Continuous Batching'],
        pseudoCode:`// LLM Inference call (LangChain.js)
import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({
  modelName: "gpt-4",
  streaming: true
});

async function streamAnswer(prompt) {
  const stream = await model.stream(prompt);
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
}`,
        pseudoCodePython:`# vLLM streaming inference server
from vllm import LLM, SamplingParams
llm = LLM(model='meta-llama/Llama-3-8B')
params = SamplingParams(temperature=0.7, max_tokens=512)
# FastAPI streaming endpoint
@app.post('/infer')
async def infer(req: InferRequest):
    async def streamer():
        for output in llm.generate(req.prompt, params):
            yield output.outputs[0].text
    return StreamingResponse(streamer())` },

      monitor: {id:'monitor',icon:'eye',        label:'Drift Monitor',     left:'82%',top:'72%', title:'Model Observability Daemon',
        descBeginner:'The observant supervisor. It watches every real-world answer the AI produces and flags when it starts making too many mistakes so retraining is triggered.',
        descPro:'Statistical monitoring daemon computing Population Stability Index (PSI), Jensen-Shannon divergence, and real-time F1-score decay against a baseline distribution.',
        details:['PSI / JS Divergence','F1-Score Trending','Automated Retraining Trigger'],
        pseudoCode:`// Drift detection in Node.js (pseudo-code)
import { monitor } from './observability';

monitor.onDriftDetected((score) => {
  if (score > 0.2) {
    console.error('Model drift detected! Alerting...');
    triggerRetraining();
  }
});`,
        pseudoCodePython:`# Compute PSI for feature drift detection
import numpy as np
def compute_psi(expected, actual, buckets=10):
    bins = np.percentile(expected, np.linspace(0, 100, buckets + 1))
    e_pct = np.histogram(expected, bins)[0] / len(expected)
    a_pct = np.histogram(actual,   bins)[0] / len(actual)
    e_pct = np.where(e_pct == 0, 1e-6, e_pct)
    a_pct = np.where(a_pct == 0, 1e-6, a_pct)
    psi = np.sum((a_pct - e_pct) * np.log(a_pct / e_pct))
    if psi > 0.2: trigger_retraining_pipeline()
    return psi` },
    },
    lines:[
      {id:'l1',from:'raw',to:'ingest'},   {id:'l2',from:'ingest',to:'feature'},
      {id:'l3',from:'feature',to:'gpu'},  {id:'l4',from:'gpu',to:'registry'},
      {id:'l5',from:'registry',to:'serving'},{id:'l6',from:'feature',to:'serving'},
      {id:'l7',from:'query',to:'serving'},{id:'l8',from:'serving',to:'monitor'},
      {id:'l9',from:'monitor',to:'ingest'},
    ],
    simulate:[
      {from:'raw',to:'ingest',    type:'background',dur:600, logBeginner:'Pulling raw data from storage.',logPro:'Extracting S3 blob partitions into Spark executor memory.'},
      {node:'ingest', process:true,dur:500, logBeginner:'Cleaning and formatting the data.',logPro:'Spark ETL imputing nulls, normalising feature vectors.'},
      {from:'ingest',to:'feature',type:'request',dur:500, logBeginner:'Storing prepped data in Feature Store.',logPro:'Serialising normalised tensors into Feast offline store.'},
      {node:'feature',process:true,dur:350, logBeginner:'Feature store indexed and ready.',logPro:'Offline/online vector sync committed.'},
      {from:'feature',to:'gpu',   type:'request',dur:700, logBeginner:'Sending data to supercomputer cluster.',logPro:'Dispatching tensor batches to A100 cluster via NFS mount.'},
      {node:'gpu',    process:true,dur:900, logBeginner:'AI is learning from the data — this takes a while!',logPro:'Distributed backpropagation executing NCCL all-reduce gradient sync across 8 GPUs.'},
      {from:'gpu',to:'registry',  type:'response',dur:500, logBeginner:'Training complete — saving the AI brain.',logPro:'Serialising checkpoint weights (.pt) to MLflow registry with benchmark metadata.'},
      {node:'registry',process:true,dur:350, logBeginner:'Model archived and versioned.',logPro:'Staging gate evaluation — promoting v2.1.0 to candidate.'},
      {from:'registry',to:'serving',type:'request',dur:500, logBeginner:'Loading AI model into the live server.',logPro:'Serving container pulling model artifact and loading weights into GPU VRAM.'},
      {node:'serving',process:true,dur:400, logBeginner:'Server is warm and ready to answer questions.',logPro:'Triton engine warming CUDA graphs — continuous batching configured.'},
      {from:'query',to:'serving', type:'request',dur:500, logBeginner:'User sends a prompt.',logPro:'gRPC inference request dispatched with tokenised input tensor.'},
      {from:'feature',to:'serving',type:'background',dur:400, logBeginner:'Fetching context from feature store.',logPro:'Online feature hydration for inference-time context enrichment.'},
      {node:'serving',process:true,dur:500, logBeginner:'AI generating the answer.',logPro:'CUDA forward-pass producing token logits — top-p sampling applied.'},
      {from:'serving',to:'query', type:'response',dur:600, logBeginner:'AI answer delivered to user.',logPro:'Token stream serialised and returned via chunked HTTP response.'},
      {from:'serving',to:'monitor',type:'background',dur:500, logBeginner:'Logging the answer for quality checks.',logPro:'Prediction metadata async-shipped to drift monitor for PSI evaluation.'},
      {node:'monitor',process:true,dur:400, logBeginner:'Checking if AI is still accurate.',logPro:'Computing JS divergence against baseline distribution.'},
      {from:'monitor',to:'ingest',type:'background',dur:600, logBeginner:'Flagging data for retraining if needed.',logPro:'Drift signal routing stale samples back into ETL pipeline for retraining.'},
    ],
  },

  /* ================================================================
     3. DATA ENGINEERING PIPELINE
  ================================================================ */
  data:{
    id:'data',
    name:'Data Engineering Architecture',
    regions:[
      {id:'rd1',label:'Telemetry Ingress',       left:'19%',top:'14%',width:'22%',height:'72%'},
      {id:'rd2',label:'Distributed Processing',  left:'47%',top:'14%',width:'24%',height:'72%'},
      {id:'rd3',label:'Analytics Delivery',      left:'77%',top:'18%',width:'18%',height:'62%'},
    ],
    nodes:{
      iot:       {id:'iot',      icon:'wifi',        label:'IoT Telemetry',       left:'7%', top:'28%', title:'High-Velocity IoT Sensors',
        descBeginner:'Millions of smart devices — thermostats, cars, factory machines — screaming tiny data fragments every millisecond.',
        descPro:'Edge devices emitting unstructured JSON micro-events over MQTT v5 / WebSocket protocols at thousands of messages per second per device cluster.',
        details:['MQTT v5 Protocol','High-Velocity Events','Unstructured Payloads'],
        pseudoCode:`// MQTT publisher (Node.js)
import mqtt from 'mqtt';
const client = mqtt.connect('mqtt://broker.iot.internal');

setInterval(() => {
  const payload = JSON.stringify({
    device_id: 'sensor-042',
    temp: getTemp(),
    ts: Date.now() / 1000
  });
  client.publish('telemetry/factory/temp', payload);
}, 100);`,
        pseudoCodePython:`# MQTT publisher (Python paho-mqtt)
import paho.mqtt.client as mqtt
import json, time
client = mqtt.Client()
client.connect('broker.iot.internal', 1883)
while True:
    payload = json.dumps({
        'device_id': 'sensor-042',
        'temp': read_celsius(),
        'ts': time.time()
    })
    client.publish('telemetry/factory/temp', payload)
    time.sleep(0.1) # 10 msgs/sec per device` },

      cdc:       {id:'cdc',      icon:'server',      label:'Legacy DB CDC',       left:'7%', top:'72%', title:'Change Data Capture Agent',
        descBeginner:'A quiet spy inside old databases — it watches every row-level change and immediately forwards it as a stream event.',
        descPro:'Debezium connector tailing the Postgres WAL or MySQL binlog, converting row mutations into structured CDC events pushed to Kafka topics.',
        details:['WAL / Binlog Polling','Debezium Connector','Incremental Row Export'],
        pseudoCode:`// Node.js Kafka consumer (pseudo-code)
import { Kafka } from 'kafkajs';
const kafka = new Kafka({ brokers: ['kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'cdc-group' });

await consumer.connect();
await consumer.subscribe({ topic: 'db.orders' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const change = JSON.parse(message.value.toString());
    processOrderMutation(change.after);
  }
});`,
        pseudoCodePython:`# Debezium connector config (connector.json)
{
  "name": "postgres-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db.internal",
    "database.port":     "5432",
    "database.user":     "debezium",
    "database.dbname":   "orders",
    "table.include.list":"public.orders",
    "plugin.name":       "pgoutput",
    "topic.prefix":      "cdc"
  }
}` },

      kafka:     {id:'kafka',    icon:'fast-forward',label:'Kafka Cluster',       left:'30%',top:'50%', title:'Apache Kafka Event Bus',
        descBeginner:'The indestructible super-highway of data. Every message is permanently recorded in perfect order — millions per second without dropping one.',
        descPro:'Distributed immutable append-only log across partitioned topics. Producers write with at-least-once semantics; consumers maintain independent offset pointers per group.',
        details:['Immutable Partition Log','Consumer Group Offsets','At-Least-Once Delivery'],
        pseudoCode:`// Node.js Kafka producer (kafkajs)
import { Kafka } from 'kafkajs';
const kafka = new Kafka({ brokers: ['kafka:9092'] });
const producer = kafka.producer();

await producer.connect();
await producer.send({
  topic: 'telemetry.sensors',
  messages: [{ key: 'sensor-042', value: JSON.stringify(payload) }]
});`,
        pseudoCodePython:`# Kafka producer (Python confluent-kafka)
from confluent_kafka import Producer
p = Producer({'bootstrap.servers': 'kafka:9092'})
def acked(err, msg):
    if err: print('Delivery failed:', err)
p.produce(
    topic='telemetry.sensors',
    key='sensor-042',
    value=payload_bytes,
    callback=acked
)
p.flush() # wait for broker ACK before returning` },

      spark:     {id:'spark',    icon:'zap',         label:'Spark Streaming',     left:'60%',top:'28%', title:'Apache Spark Stream Processor',
        descBeginner:'The real-time speed-reader. It reads the highway while it is moving, running instant calculations within seconds of events arriving.',
        descPro:'Structured Streaming micro-batch engine executing sliding-window aggregations, stateful join operations, and watermarked late-data handling on Kafka topic partitions.',
        details:['Micro-Batch Window','Stateful Join Operators','Watermark Late-Data Handling'],
        pseudoCode:`// Node.js stream processing (pseudo-code)
import { transform } from 'stream-processor';

const stream = kafka.subscribe('sensors');
stream
  .window('1m')
  .groupBy('device_id')
  .avg('temp')
  .outputTo('dashboard-api');`,
        pseudoCodePython:`# Spark Structured Streaming — windowed agg
from pyspark.sql import functions as F
df = spark.readStream.format('kafka') \
    .option('kafka.bootstrap.servers','kafka:9092') \
    .option('subscribe','telemetry.sensors').load()
parsed = df.select(F.from_json('value', schema).alias('d')).select('d.*')
result = parsed \
    .withWatermark('ts', '30 seconds') \
    .groupBy(F.window('ts','1 minute'),'device_id') \
    .agg(F.avg('temp').alias('avg_temp'))
result.writeStream.format('memory').queryName('live').start()` },

      airflow:   {id:'airflow',  icon:'clock',       label:'Airflow ETL',         left:'60%',top:'72%', title:'Apache Airflow Batch Orchestrator',
        descBeginner:'The night-shift warehouse sorter. On a schedule, it wakes up, grabs millions of records, cleans and joins them in bulk, and delivers clean stacks to storage.',
        descPro:'DAG-based workflow orchestrator executing CRON-triggered Python tasks (Extract → Transform → Load) with retry policies, SLA alerts, and lineage metadata collection.',
        details:['CRON DAG Orchestration','SLA Monitoring','Lineage Metadata Tracking'],
        pseudoCode:`// Node.js Task Scheduler (pseudo-code)
import { scheduler } from '@data/core';

scheduler.addJob({
  name: 'daily-etl',
  cron: '0 0 * * *',
  tasks: [
    { id: 'extract',  fn: kafkaDump },
    { id: 'transform', fn: dataClean },
    { id: 'load',     fn: snowflakePush }
  ],
  retry: { max: 3, delay: '5m' }
});`,
        pseudoCodePython:`# Airflow DAG definition
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
with DAG('daily_etl', schedule_interval='@daily',
         start_date=datetime(2024,1,1)) as dag:
    extract = PythonOperator(
        task_id='extract', python_callable=extract_from_kafka)
    transform = PythonOperator(
        task_id='transform', python_callable=clean_and_join)
    load = PythonOperator(
        task_id='load', python_callable=write_to_snowflake)
    extract >> transform >> load` },

      dashboard: {id:'dashboard',icon:'pie-chart',   label:'BI Dashboard',        left:'87%',top:'28%', title:'Real-Time BI Visualisation',
        descBeginner:'The live TV screen on the office wall. It updates every second showing exactly what is happening right now across the whole system.',
        descPro:'Grafana / Apache Superset subscribing to time-series queries via WebSocket channels, rendering sub-second metric panels from ClickHouse or in-memory caches.',
        details:['WebSocket Subscription','Sub-Second Refresh','Time-Series Queries'],
        pseudoCode:`// React BI Panel (WebSocket)
import { useDashboardData } from './hooks';

function SensorChart() {
  const { data, status } = useDashboardData('factory-temp');
  
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Line type="monotone" dataKey="avg_temp" />
      </LineChart>
    </ResponsiveContainer>
  );
}`,
        pseudoCodePython:`# Python Dash / Streamlit Dashboard
import streamlit as st
import pandas as pd

st.title("Real-Time IoT Monitor")
def load_data():
    return pd.read_sql("SELECT * FROM live_sensors", engine)

df = load_data()
st.line_chart(df.set_index('time')['avg_temp'])
st.button("Manual Refresh")` },

      olap:      {id:'olap',     icon:'layers',      label:'Snowflake Warehouse', left:'87%',top:'72%', title:'Cloud OLAP Data Warehouse',
        descBeginner:'The infinite super-library. Analysts can instantly query years of history across billions of rows to find any business trend.',
        descPro:'Snowflake virtual warehouses with auto-suspended compute clusters querying S3-backed columnar micro-partitions using MPP SQL, fully isolated from OLTP workloads.',
        details:['MPP Columnar SQL','Auto-Suspend Compute','Micro-Partition Pruning'],
        pseudoCode:`// Node.js Snowflake Query (snowflake-sdk)
import snowflake from 'snowflake-sdk';
const connection = snowflake.createConnection({ ... });

connection.execute({
  sqlText: 'SELECT * FROM fact_sensors LIMIT 100',
  complete: (err, stmt, rows) => {
    console.log('Query result:', rows);
  }
});`,
        pseudoCodePython:`-- Snowflake: load parquet from S3 stage
CREATE OR REPLACE STAGE etl_stage
  URL='s3://data-warehouse-bucket/daily/'
  FILE_FORMAT=(TYPE=PARQUET);
COPY INTO fact_sensors
FROM @etl_stage
MATCH_BY_COLUMN_NAME=CASE_INSENSITIVE
ON_ERROR=SKIP_FILE;
-- Auto-suspend warehouse after 5 min idle
ALTER WAREHOUSE analytics_wh SET AUTO_SUSPEND=300;` },
    },
    lines:[
      {id:'d1',from:'iot',  to:'kafka'}, {id:'d2',from:'cdc',to:'kafka'},
      {id:'d3',from:'kafka',to:'spark'}, {id:'d4',from:'kafka',to:'airflow'},
      {id:'d5',from:'spark',to:'dashboard'},{id:'d6',from:'airflow',to:'olap'},
    ],
    simulate:[
      {from:'iot',to:'kafka',      type:'request',   dur:400, logBeginner:'Sensors firing millions of events.',logPro:'MQTT JSON micro-packets appended to Kafka topic partition.'},
      {from:'cdc',to:'kafka',      type:'request',   dur:400, logBeginner:'Legacy database streaming record changes.',logPro:'Debezium WAL snapshot events forwarded to Kafka CDC topic.'},
      {node:'kafka',  process:true,dur:450, logBeginner:'Event bus organising all incoming streams.',logPro:'Leader partition replicating across ISR brokers — offset committed.'},
      {from:'kafka',to:'spark',    type:'response',  dur:500, logBeginner:'Real-time processor reading the stream.',logPro:'Spark consumer group polling latest Kafka offsets at micro-batch trigger.'},
      {node:'spark',  process:true,dur:500, logBeginner:'Counting and aggregating events instantly.',logPro:'Sliding-window aggregation over 30s watermark; stateful join executed in-memory.'},
      {from:'spark',to:'dashboard',type:'response',  dur:400, logBeginner:'Dashboard updated live!',logPro:'Aggregated metrics pushed to Grafana WebSocket panel — sub-second latency.'},
      {from:'kafka',to:'airflow',  type:'background',dur:800, logBeginner:'Batch job triggered to process historical data.',logPro:'Airflow CRON DAG triggered — extracting day partition from Kafka compacted topic.'},
      {node:'airflow',process:true,dur:700, logBeginner:'Night-shift cleaner sorting big data stacks.',logPro:'DAG executing dimension-join transformations with SCD Type-2 handling.'},
      {from:'airflow',to:'olap',   type:'background',dur:600, logBeginner:'Cleaned records loaded into warehouse.',logPro:'Transformed parquet files written to Snowflake micro-partitions; query cache invalidated.'},
      {node:'olap',   process:true,dur:350, logBeginner:'Warehouse indexed and ready for analysts.',logPro:'Snowflake clustering key recalculated — virtual warehouse auto-suspended.'},
    ],
  },

  /* ================================================================
     4. EVENT-DRIVEN ARCHITECTURE
  ================================================================ */
  event:{
    id:'event',
    name:'Event-Driven Architecture',
    regions:[
      {id:'re1',label:'Ingress',              left:'19%',top:'38%',width:'12%',height:'24%'},
      {id:'re2',label:'Message Broker',       left:'37%',top:'18%',width:'14%',height:'64%'},
      {id:'re3',label:'Async Microservices',  left:'57%',top:'12%',width:'26%',height:'76%'},
    ],
    nodes:{
      client:  {id:'client', icon:'monitor',       label:'Frontend App',    left:'7%', top:'50%', title:'User Interface',
        descBeginner:'The user placing an order. The moment they click "Buy", a message is created and handed to the gateway — the app does not wait for anything else.',
        descPro:'SPA dispatching an HTTP POST to the API Gateway. The synchronous call returns immediately after the command is accepted by the broker — decoupled from downstream execution.',
        details:['HTTP POST','Immediate Response','Fire-and-Forget Command'],
        pseudoCode:`// Fire-and-forget order submission
async function placeOrder(cart) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart)
  });
  // 202 Accepted — not 200 OK
  if (res.status === 202) {
    showToast('Order received! Processing...');
    // UI doesn\'t wait — status updates via WebSocket
    ws.subscribe('order.' + cart.id, updateUI);
  }
}`,
        pseudoCodePython:`# Python Asynchronous Request
import requests

def submit_order(cart_data):
    # Respond with 202 Accepted immediately
    response = requests.post(
        "https://api.myapp.com/orders", 
        json=cart_data
    )
    if response.status_code == 202:
        print("Order accepted for processing...")
    return response.json()` },

      gateway: {id:'gateway',icon:'router',        label:'API Gateway',     left:'25%',top:'50%', title:'Command Gateway',
        descBeginner:'The front door. It accepts your command, validates your identity, and passes the event to the post office — without waiting to see if it was delivered.',
        descPro:'API Gateway serialising the validated command into a structured CloudEvent envelope and publishing it to the message broker exchange.',
        details:['CloudEvent Wrapping','Auth Validation','Async ACK Response'],
        pseudoCode:`// Express handler — publish and return 202
app.post('/api/orders', verifyJWT, async (req, res) => {
  const event = {
    id:          uuidv4(),
    type:        'order.created',
    source:      '/api/orders',
    data:        req.body,
    datacontenttype: 'application/json'
  };
  await rabbitMQ.publish('orders.exchange', event);
  res.status(202).json({ eventId: event.id });
});`,
        pseudoCodePython:`# FastAPI Async Endpoint with RabbitMQ
from fastapi import FastAPI, BackgroundTasks
import pika, json

app = FastAPI()

def push_to_queue(data):
    # Connect and publish to RabbitMQ
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.basic_publish(exchange='orders', routing_key='', body=json.dumps(data))
    connection.close()

@app.post("/orders", status_code=202)
async def create_order(order: dict, bg_tasks: BackgroundTasks):
    bg_tasks.add_task(push_to_queue, order)
    return {"message": "Order accepted"}` },

      bus:     {id:'bus',    icon:'repeat',        label:'Event Broker',    left:'44%',top:'50%', title:'Central Message Broker',
        descBeginner:'The mega post office. It receives events and instantly broadcasts copies to every service subscribed to that topic — zero waiting.',
        descPro:'RabbitMQ exchange (or AWS EventBridge) routing events via Fanout/Topic bindings to multiple queue subscribers asynchronously with durability guarantees.',
        details:['Fanout Exchange','Durable Queues','At-Least-Once Delivery'],
        pseudoCode:`// Node.js RabbitMQ setup (amqplib)
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
await ch.assertExchange('orders', 'fanout', { durable: true });

const q = await ch.assertQueue('order-svc', { durable: true });
await ch.bindQueue(q.queue, 'orders', '');

ch.consume(q.queue, (msg) => {
  console.log("Msg received:", msg.content.toString());
  ch.ack(msg);
});`,
        pseudoCodePython:`# RabbitMQ fanout exchange setup
import pika
conn = pika.BlockingConnection(pika.ConnectionParameters('rabbit'))
ch = conn.channel()
ch.exchange_declare(exchange='orders', exchange_type='fanout',
                    durable=True)
# Each consumer binds its own queue
ch.queue_declare(queue='order-svc', durable=True)
ch.queue_bind('order-svc', exchange='orders')
ch.basic_consume('order-svc', on_message_callback=handle,
                  auto_ack=False)` },

      order:   {id:'order',  icon:'shopping-cart', label:'Order Service',   left:'71%',top:'22%', title:'Order Domain Worker',
        descBeginner:'The orders department. It only listens to "Order Created" events and has one job: save the order to its own private database.',
        descPro:'Bounded-context consumer receiving `order.created` binding. Executes idempotent UPSERT into its private Postgres table with an outbox pattern for reliability.',
        details:['Idempotent UPSERT','Private Database','Outbox Pattern'],
        pseudoCode:`// Order consumer with idempotency guard
async function handleOrderCreated(event) {
  const { id, userId, items, total } = event.data;
  const exists = await db.orders.findOne({ eventId: id });
  if (exists) return ack();
  await db.transaction(async (trx) => {
    await trx.orders.insert({ eventId: id, userId, total });
    await trx.outbox.insert({ type:'receipt.send', payload: event });
  });
  ack();
}`,
        pseudoCodePython:`# Python Order Consumer (SQLAlchemy)
def handle_event(ch, method, properties, body):
    event = json.loads(body)
    # Check for duplicate processed events
    if not db.query(ProcessedEvent).filter_by(id=event['id']).first():
        order = Order(user_id=event['user_id'], amount=event['total'])
        db.add(order)
        db.commit()
    ch.basic_ack(delivery_tag=method.delivery_tag)` },

      inv:     {id:'inv',    icon:'box',           label:'Inventory Worker', left:'71%',top:'50%', title:'Inventory Domain Worker',
        descBeginner:'The stock room. It listens for the same order event and subtracts the correct item from stock automatically — no one needs to tell it manually.',
        descPro:'Independent consumer subscribing to `order.created`. Executes an atomic stock-decrement with an optimistic lock check, emitting `inventory.reserved` on success.',
        details:['Atomic Stock Decrement','Optimistic Locking','inventory.reserved Event'],
        pseudoCode:`// Inventory consumer — optimistic lock decrement
async function handleOrder(event) {
  const { itemId, qty } = event.data;
  const updated = await db.raw(
    'UPDATE inventory SET stock = stock - ? WHERE item_id = ? AND stock >= ?',
    [qty, itemId, qty]
  );
  if (updated.rowCount === 0)
    throw new Error('INSUFFICIENT_STOCK');
  await eventBus.emit('inventory.reserved', { itemId, qty });
  ack();
}`,
        pseudoCodePython:`# Python Inventory Counter (Redis/SQL)
def decrement_stock(event):
    # Atomic decrement via raw SQL
    with db.begin() as conn:
        res = conn.execute(
            "UPDATE stock SET qty = qty - %s WHERE sku = %s AND qty >= %s",
            (event['qty'], event['sku'], event['qty'])
        )
        if res.rowcount == 1:
            publish_event("inventory.reserved", event)
        else:
            publish_event("inventory.failed", event)` },

      notify:  {id:'notify', icon:'mail',          label:'Notification Hub', left:'71%',top:'78%', title:'Notification Side-Effect Worker',
        descBeginner:'The friendly emailer. It also hears the order event and automatically sends you a confirmation email — completely independently of everything else.',
        descPro:'Stateless consumer publishing SMTP email and SMS confirmations via SendGrid/Twilio upon `order.created`. Side-effect only — does not write to any database.',
        details:['SMTP / Twilio Dispatch','Side-Effect Only','No State Mutation'],
        pseudoCode:`// Notification consumer — send email (SendGrid)
import sg from '@sendgrid/mail';
async function handleOrder(event) {
  await sg.send({
    to: event.user.email,
    from: 'orders@shop.com',
    subject: 'Order Confirmed!',
    text: \`You spent $\${event.total}\`
  });
  ack();
}`,
        pseudoCodePython:`# Python Notification Dispatch (Twillio/Boto3)
import boto3

def send_confirmation(event):
    # Dispatch email via Amazon SES
    ses = boto3.client('ses')
    ses.send_email(
        Source='orders@shop.com',
        Destination={'ToAddresses': [event['email']]},
        Message={
            'Subject': {'Data': 'Order Received'},
            'Body': {'Text': {'Data': f"Success! Total: {event['amount']}"}}
        }
    )` },

      db1:     {id:'db1',    icon:'database',      label:'Order DB',        left:'89%',top:'22%', title:'Order Domain Database',
        descBeginner:'The private filing cabinet exclusively for the Orders service.',
        descPro:'Isolated PostgreSQL instance scoped to the Order bounded-context. No cross-service joins are permitted — data shared only via events.',
        details:['Domain Isolation','No Cross-Join','Event-Sourced Updates'],
        pseudoCode:`-- SQL Table for Order Data
CREATE TABLE orders (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL,
  total       DECIMAL(10,2),
  status      VARCHAR(20)
);`,
        pseudoCodePython:`# Python SQLAlchemy Order Model
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Order(Base):
    __tablename__ = 'orders'
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    total = Column(Float)
    status = Column(String, default='PENDING')` },

      db2:     {id:'db2',    icon:'database',      label:'Inventory DB',    left:'89%',top:'50%', title:'Inventory Domain Database',
        descBeginner:'The private stock counter exclusively for the Inventory service.',
        descPro:'Redis hash-map store for high-throughput atomic integer decrements on SKU stock counts. Commands executed as Lua scripts for atomicity.',
        details:['Atomic DECR Command','Lua Script Atomicity','Low-Latency Writes'],
        pseudoCode:`// Redis Inventory decrement (Node.js)
const stock = await redis.get('sku:42');
if (stock >= requestedQty) {
  await redis.decrby('sku:42', requestedQty);
} else {
  throw new Error('Out of stock');
}`,
        pseudoCodePython:`# Python Redis Inventory (redis-py)
import redis

r = redis.Redis()

def reserve_stock(sku, qty):
    # Atomic LUA script execution
    lua = """
    local stock = redis.call('get', KEYS[1])
    if tonumber(stock) >= tonumber(ARGV[1]) then
        return redis.call('decrby', KEYS[1], ARGV[1])
    else
        return -1
    end
    """
    result = r.eval(lua, 1, sku, qty)
    return result != -1` },
    },
    lines:[
      {id:'e1',from:'client',to:'gateway'},{id:'e2',from:'gateway',to:'bus'},
      {id:'e3',from:'bus',to:'order'},    {id:'e4',from:'bus',to:'inv'},
      {id:'e5',from:'bus',to:'notify'},   {id:'e6',from:'order',to:'db1'},
      {id:'e7',from:'inv',to:'db2'},
    ],
    simulate:[
      {from:'client',to:'gateway',  type:'request',   dur:400, logBeginner:'User clicks "Buy Now".',logPro:'HTTP POST /orders dispatched with order payload.'},
      {node:'gateway', process:true,dur:350, logBeginner:'Gateway validates identity and wraps command.',logPro:'JWT verified — command wrapped in CloudEvent envelope.'},
      {from:'gateway',to:'bus',     type:'request',   dur:400, logBeginner:'Command published to messaging post office.',logPro:'CloudEvent published to RabbitMQ exchange — durable ack received.'},
      {node:'bus',     process:true,dur:350, logBeginner:'Post office broadcasting to all subscribed services.',logPro:'Fanout exchange routing event copies to order, inventory, notification queues.'},
      {from:'bus',to:'order',       type:'request',   dur:400, logBeginner:'Order worker receives the event.',logPro:'order.created consumed by Order service — processing idempotent UPSERT.'},
      {from:'bus',to:'inv',         type:'request',   dur:400, logBeginner:'Inventory worker receives the event simultaneously.',logPro:'order.created consumed by Inventory service — executing atomic DECR.'},
      {from:'bus',to:'notify',      type:'request',   dur:400, logBeginner:'Email worker receives the event simultaneously.',logPro:'order.created consumed by Notification service — SMTP dispatch queued.'},
      {node:'order',   process:true,dur:400, logBeginner:'Order saved to private database.',logPro:'Idempotent UPSERT committed to Orders Postgres instance.'},
      {node:'inv',     process:true,dur:350, logBeginner:'Stock count decremented.',logPro:'Redis Lua DECR script executed atomically — inventory.reserved emitted.'},
      {node:'notify',  process:true,dur:350, logBeginner:'Sending confirmation email.',logPro:'SendGrid SMTP payload dispatched — delivery receipt awaited.'},
      {from:'order',to:'db1',       type:'background',dur:500},
      {from:'inv',to:'db2',         type:'background',dur:500},
      {from:'gateway',to:'client',  type:'response',  dur:400, logBeginner:'Response returned instantly — no waiting!',logPro:'202 Accepted returned synchronously; all downstream work is async.'},
    ],
  },

  /* ================================================================
     5. MICROSERVICES MESH
  ================================================================ */
  microservices:{
    id:'microservices',
    name:'Microservices Architecture',
    regions:[
      {id:'rm1',label:'Ingress',             left:'19%',top:'38%',width:'12%',height:'24%'},
      {id:'rm2',label:'Service Mesh',        left:'37%',top:'12%',width:'22%',height:'76%'},
      {id:'rm3',label:'Isolated Datastores', left:'66%',top:'12%',width:'20%',height:'76%'},
    ],
    nodes:{
      client:   {id:'client',   icon:'monitor',      label:'Web / Mobile Client', left:'7%', top:'50%', title:'End-User Device',
        descBeginner:'The user\'s browser or phone app sending requests to multiple specialised services simultaneously.',
        descPro:'SPA or native client issuing parallel REST / GraphQL calls per bounded context, each authenticated independently via shared Identity Provider.',
        details:['Parallel Service Calls','Per-Service Auth','REST / GraphQL'],
        pseudoCode:`// Parallel service calls with Promise.all
const [profile, catalog, billing] = await Promise.all([
  fetch('/auth/me',    { headers: authHeader() }).then(r => r.json()),
  fetch('/catalog',    { headers: authHeader() }).then(r => r.json()),
  fetch('/billing/me', { headers: authHeader() }).then(r => r.json()),
]);
function authHeader() {
  return { Authorization: 'Bearer ' + getToken() };
}`,
        pseudoCodePython:`# Python Asynchronous Parallel Requests (httpx)
import asyncio, httpx

async def fetch_all(token):
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient(headers=headers) as client:
        # Parallel execution of multiple microservice calls
        profile, catalog, billing = await asyncio.gather(
            client.get("https://api.myapp.com/auth/me"),
            client.get("https://api.myapp.com/catalog"),
            client.get("https://api.myapp.com/billing")
        )
    return profile.json(), catalog.json(), billing.json()` },

      gateway:  {id:'gateway',  icon:'router',       label:'Ingress Proxy',       left:'25%',top:'50%', title:'API Gateway / Service Mesh Ingress',
        descBeginner:'The master traffic cop. It knows exactly which door to forward each request to, based on the URL path.',
        descPro:'Envoy-based sidecar proxy (Istio / Linkerd) performing L7 path routing, mTLS service-to-service encryption, circuit breaking, and retries.',
        details:['mTLS Encryption','Circuit Breaking','L7 Path Routing'],
        pseudoCode:`// Node.js Express Gateway config
const gateway = require('express-gateway');

gateway().load(path.join(__dirname, 'config')).run();
// In gateway.config.yml:
// policies: [ 'proxy', 'cors', 'auth' ]
// pipelines: { default: { apiEndpoints: ['profile'], policies: [{ proxy: 'svc-auth' }] } }`,
        pseudoCodePython:`# Python Traefik/FastAPI Ingress Logic
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def ingress_proxy(request: Request, call_next):
    # mTLS and Circuit Breaking handled by Service Mesh (Envoy/Istio)
    # This middleware handles internal L7 routing prefixing
    path = request.url.path
    if path.startswith("/auth"):
        return await forward_to("auth-service:8080", request)
    return await call_next(request)` },

      auth_svc: {id:'auth_svc', icon:'shield',       label:'Auth Service',        left:'47%',top:'22%', title:'Identity & Access Service',
        descBeginner:'The ID department. Its single job is verifying who you are — nothing else.',
        descPro:'Dedicated OAuth2 / OIDC issuer. Issues short-lived JWTs, validates credentials, manages refresh token rotation, and handles MFA flows.',
        details:['OIDC / OAuth2 Issuer','Short-Lived JWT Minting','MFA Flow Handling'],
        pseudoCode:`// Keycloak OIDC token exchange (Node.js)
import { Issuer } from 'openid-client';
const keycloak = await Issuer.discover('https://auth.internal/realms/app');
const client = new keycloak.Client({ client_id: 'api-svc', client_secret: process.env.CLIENT_SECRET });

async function introspect(token) {
  const result = await client.introspect(token);
  return result.active; // true/false
}`,
        pseudoCodePython:`# Python OIDC Intropection (Authlib)
from authlib.integrations.requests_client import OAuth2Session

def verify_token(token):
    client = OAuth2Session(client_id, client_secret)
    # RFC 7662 token introspection
    token_info = client.introspect_token(
        'https://auth.internal/introspect', 
        token=token
    )
    return token_info.get('active') is True` },

      bill_svc: {id:'bill_svc', icon:'credit-card',  label:'Billing Service',     left:'47%',top:'50%', title:'Payment Domain Service',
        descBeginner:'The cashier. Its only job is handling payments — completely isolated from everything else.',
        descPro:'Synchronous gRPC service integrating with Stripe/Braintree APIs. Manages idempotency keys to prevent duplicate charges on retry.',
        details:['Stripe gRPC Integration','Idempotency Key Guard','Charge Retry Logic'],
        pseudoCode:`// Stripe charge (Node.js)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY);

async function createCharge(orderId, amount) {
  return await stripe.paymentIntents.create({
    amount, currency: 'usd', confirm: true
  }, { idempotencyKey: 'order-' + orderId });
}`,
        pseudoCodePython:`# Python Stripe Integration (stripe-python)
import stripe, os

stripe.api_key = os.getenv("STRIPE_KEY")

def process_billing(order_id, amount_cents):
    # Idempotency prevents double-charging on network retry
    return stripe.PaymentIntent.create(
        amount=amount_cents,
        currency="usd",
        idempotency_key=f"order_{order_id}"
    )` },

      prod_svc: {id:'prod_svc', icon:'shopping-bag', label:'Catalog Service',     left:'47%',top:'78%', title:'Product Catalog Service',
        descBeginner:'The shelving department. Its only job is returning product lists and details — fast.',
        descPro:'Read-heavy REST service backed by a read replica cluster. Responses cached in Redis with cache-aside pattern; invalidated on inventory events.',
        details:['Read-Replica Backed','Cache-Aside Pattern','Inventory Event Invalidation'],
        pseudoCode:`// Catalog Service (Node.js + Redis)
async function getCatalog(filters) {
  const cached = await redis.get('cat:' + filters.id);
  if (cached) return JSON.parse(cached);
  
  const data = await db.products.findMany({ where: filters });
  await redis.setex('cat:' + filters.id, 300, JSON.stringify(data));
  return data;
}`,
        pseudoCodePython:`# Python Catalog API (FastAPI)
from fastapi import FastAPI, Depends
import redis

app = FastAPI()
r = redis.Redis(host='cache-host')

@app.get("/catalog/{item_id}")
def read_item(item_id: str):
    # Cache-aside pattern
    cached = r.get(f"item:{item_id}")
    if cached:
        return json.loads(cached)
    
    item = db.fetch_product(item_id)
    r.setex(f"item:{item_id}", 3600, json.dumps(item))
    return item` },

      auth_db:  {id:'auth_db',  icon:'database',     label:'Identity DB',         left:'76%',top:'22%', title:'Auth Bounded-Context Database',
        descBeginner:'The private safe storing credentials — completely inaccessible to other services.',
        descPro:'Hardened Postgres instance with column-level encryption (Argon2 hashed passwords), row-level security policies, and audit logging.',
        details:['Argon2 Hashed Passwords','Column-Level Encryption','Audit Log'],
        pseudoCode:`-- SQL Identities Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT -- argon2
);`,
        pseudoCodePython:`# Python ORM for Identity (SQLAlchemy)
from sqlalchemy import Column, String, LargeBinary
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    # Hashed via Argon2 / Bcrypt
    password_hash = Column(String)` },

      bill_db:  {id:'bill_db',  icon:'database',     label:'Ledger DB',           left:'76%',top:'50%', title:'Payment Ledger Database',
        descBeginner:'The receipts vault. Every payment is written here permanently and can never be deleted.',
        descPro:'Immutable append-only ledger (Postgres with insert-only policy). Every charge, refund, and dispute written as a new row — no deletions or updates ever.',
        details:['Append-Only Ledger','No DELETE / UPDATE','Financial Audit Trail'],
        pseudoCode:`-- SQL Billing Ledger
CREATE TABLE billing_ledger (
  id UUID PRIMARY KEY,
  order_id UUID,
  amount DECIMAL(10,2),
  type VARCHAR(20) -- CHARGE, REFUND
);`,
        pseudoCodePython:`# Python Financial Ledger (Django ORM)
from django.db import models

class LedgerEntry(models.Model):
    TYPES = [('C', 'Charge'), ('R', 'Refund')]
    order_id = models.UUIDField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    entry_type = models.CharField(max_length=1, choices=TYPES)
    
    class Meta:
        db_table = 'immutable_ledger'` },

      prod_db:  {id:'prod_db',  icon:'database',     label:'Catalog DB',          left:'76%',top:'78%', title:'Product Catalog Database',
        descBeginner:'The product shelf database — optimised for extremely fast look-ups.',
        descPro:'Elasticsearch or PostgreSQL read-replica cluster optimised for full-text search, filtered faceted queries, and high read throughput.',
        details:['Full-Text Search','Faceted Query Filtering','Read-Replica Scaling'],
        pseudoCode:`// Elasticsearch query (Node.js)
import { Client } from '@elastic/elasticsearch';
const es = new Client({ node: 'https://search.internal' });

async function search(term) {
  return await es.search({
    index: 'products',
    body: { query: { match: { name: term } } }
  });
}`,
        pseudoCodePython:`# Elasticsearch full-text + faceted query
from elasticsearch import Elasticsearch
es = Elasticsearch('https://search.internal:9200')
result = es.search(index='products', body={
  'query': {
    'multi_match': { 'query': search_term,
                     'fields': ['name^3','description'] }
  },
  'aggs': {
    'by_category': { 'terms': { 'field': 'category.keyword' } },
    'price_range': { 'range': { 'field': 'price',
      'ranges': [{'to':50},{'from':50,'to':200},{'from':200}]
    }}
  }
})` },
    },
    lines:[
      {id:'m1',from:'client',to:'gateway'},
      {id:'m2',from:'gateway',to:'auth_svc'},{id:'m3',from:'gateway',to:'bill_svc'},{id:'m4',from:'gateway',to:'prod_svc'},
      {id:'m5',from:'auth_svc',to:'auth_db'},{id:'m6',from:'bill_svc',to:'bill_db'},{id:'m7',from:'prod_svc',to:'prod_db'},
    ],
    simulate:[
      {from:'client',to:'gateway',    type:'request',   dur:500, logBeginner:'User opens product page and logs in.',logPro:'Parallel REST GET /products and POST /auth dispatched from SPA.'},
      {node:'gateway',  process:true, dur:350, logBeginner:'Gateway routing request to correct service.',logPro:'Ingress evaluates L7 path — routes /auth to AuthSvc via mTLS sidecar.'},
      {from:'gateway',to:'auth_svc',  type:'request',   dur:400, logBeginner:'Checking identity in Auth service.',logPro:'JWT validation request forwarded to OIDC provider.'},
      {node:'auth_svc', process:true, dur:400, logBeginner:'Identity verified.',logPro:'OIDC token introspected — short-lived JWT minted and returned.'},
      {from:'auth_svc',to:'auth_db',  type:'request',   dur:400, logBeginner:'Checking credentials in secure vault.',logPro:'SELECT with Argon2 hash comparison against identity store.'},
      {from:'auth_db',to:'auth_svc',  type:'response',  dur:350},
      {from:'auth_svc',to:'gateway',  type:'response',  dur:350, logBeginner:'Identity confirmed — routing next request.',logPro:'Auth context attached to request headers for downstream services.'},
      {from:'gateway',to:'prod_svc',  type:'request',   dur:400, logBeginner:'Fetching product catalogue.',logPro:'GET /catalog forwarded to Product service replica pool.'},
      {node:'prod_svc', process:true, dur:350, logBeginner:'Loading products from database.',logPro:'Cache-aside check — cache miss — querying read replica.'},
      {from:'prod_svc',to:'prod_db',  type:'request',   dur:400, logBeginner:'Reading from the product database.',logPro:'Elasticsearch full-text + faceted query executed on read replica.'},
      {from:'prod_db',to:'prod_svc',  type:'response',  dur:350},
      {from:'prod_svc',to:'gateway',  type:'response',  dur:350, logBeginner:'Products loaded and returned.',logPro:'Catalog payload serialised — Redis cache primed for next request.'},
      {from:'gateway',to:'bill_svc',  type:'request',   dur:400, logBeginner:'User checks out — processing payment.',logPro:'POST /charge forwarded to Billing service with idempotency key.'},
      {node:'bill_svc', process:true, dur:400, logBeginner:'Payment processing via card provider.',logPro:'Stripe gRPC CreateCharge called — idempotency key validated.'},
      {from:'bill_svc',to:'bill_db',  type:'request',   dur:400, logBeginner:'Receipt written to ledger.',logPro:'Append-only INSERT to payment ledger confirmed.'},
      {from:'bill_db',to:'bill_svc',  type:'response',  dur:350},
      {from:'bill_svc',to:'gateway',  type:'response',  dur:350},
      {from:'gateway',to:'client',    type:'response',  dur:400, logBeginner:'All done — products shown and payment confirmed!',logPro:'Aggregated responses composed by BFF layer; 200 OK returned to SPA.'},
    ],
  },

  /* ================================================================
     6. SERVERLESS CLOUD PLATFORM
  ================================================================ */
  serverless:{
    id:'serverless',
    name:'Serverless Cloud Architecture',
    regions:[
      {id:'rs1',label:'Managed Edge',       left:'19%',top:'38%',width:'12%',height:'24%'},
      {id:'rs2',label:'Ephemeral Compute',  left:'37%',top:'38%',width:'20%',height:'24%'},
      {id:'rs3',label:'Managed Services',   left:'65%',top:'12%',width:'22%',height:'76%'},
    ],
    nodes:{
      client:  {id:'client',  icon:'monitor',   label:'SPA Client',        left:'7%', top:'50%', title:'Single-Page Application',
        descBeginner:'The user\'s browser running your React/Vue app. It talks directly to cloud services — no dedicated server needed.',
        descPro:'Client-side SPA authenticated via Cognito/Auth0, issuing signed API requests with short-lived AWS SigV4 or JWT credentials.',
        details:['SigV4 / JWT Auth','Direct Cloud API Calls','Stateless Client'],
        pseudoCode:`// AWS Amplify (JavaScript)
import { Auth, API } from 'aws-amplify';

async function callAPI() {
  const user = await Auth.signIn(user, pass);
  return await API.get('MyAPI', '/items');
}`,
        pseudoCodePython:`# Python SigV4 Request (Requests + AWS SDK)
import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth

def call_secure_api(url, region):
    auth = AWSRequestsAuth(
        aws_access_key='KEYS',
        aws_secret_access_key='SECRET',
        aws_host='api.us-east-1.amazonaws.com',
        aws_region=region,
        aws_service='execute-api'
    )
    return requests.get(url, auth=auth)` },

      gateway: {id:'gateway', icon:'router',    label:'AWS API Gateway',   left:'25%',top:'50%', title:'Fully-Managed HTTP API',
        descBeginner:'Amazon\'s cloud doorman. It accepts millions of requests, validates your identity, and wakes up your code on-demand — no servers running when idle.',
        descPro:'AWS HTTP API Gateway applying JWT authoriser, request throttling, and VTL mapping templates before proxying to Lambda integration at zero-idle cost.',
        details:['JWT Authoriser','Request Throttling','Zero-Idle Cost'],
        pseudoCode:`// AWS CDK — API Gateway (TypeScript)
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const api = new apigw.HttpApi(this, 'Api');
api.addRoutes({
  path: '/items',
  methods: [apigw.HttpMethod.GET],
  integration: new HttpLambdaIntegration('Integ', handler)
});`,
        pseudoCodePython:`# AWS CDK — HTTP API + Lambda integration
from aws_cdk import aws_apigatewayv2 as apigw
from aws_cdk import aws_apigatewayv2_integrations as integ
http_api = apigw.HttpApi(self, 'MyAPI',
    cors_preflight=apigw.CorsPreflightOptions(
        allow_origins=['https://myapp.com'],
        allow_methods=[apigw.CorsHttpMethod.POST]
    ))
http_api.add_routes(
    path='/items',
    methods=[apigw.HttpMethod.POST],
    integration=integ.HttpLambdaIntegration('LambdaInteg', fn)
)` },

      lambda:  {id:'lambda',  icon:'zap',       label:'Lambda Function',   left:'46%',top:'50%', title:'AWS Lambda — Ephemeral FaaS',
        descBeginner:'A tiny piece of code that wakes up from a cold sleep specifically for your request, runs in milliseconds, then disappears completely.',
        descPro:'Firecracker MicroVM allocating an isolated 128–10,240 MB execution environment per invocation. Cold-start bootstraps the runtime; warm invocations reuse the frozen container.',
        details:['Firecracker MicroVM','Cold-Start Latency','Per-ms Billing Model'],
        pseudoCode:`// Lambda Handler (Node.js)
export const handler = async (event) => {
  const data = JSON.parse(event.body);
  console.log("Processing item:", data.id);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};`,
        pseudoCodePython:`# Lambda Handler (Python)
import json

def handler(event, context):
    body = json.loads(event['body'])
    print(f"Processing {body['id']}...")
    return {
        'statusCode': 200,
        'body': json.dumps({'ok': True})
    }` },

      dynamo:  {id:'dynamo',  icon:'database',  label:'DynamoDB',          left:'76%',top:'28%', title:'Managed NoSQL Key-Value Store',
        descBeginner:'Amazon\'s infinitely scalable database. It stores your data with a key and returns it in under a millisecond regardless of how big it grows.',
        descPro:'Fully managed NoSQL document store with provisioned or on-demand capacity. Single-digit ms p99 latency via partition-key hash routing to storage nodes.',
        details:['Partition-Key Hash Routing','Single-Digit ms Latency','Auto-Scaling Capacity'],
        pseudoCode:`// DynamoDB PutItem (Node.js SDK v3)
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});

await client.send(new PutItemCommand({
  TableName: 'Orders',
  Item: { id: { S: '123' }, status: { S: 'PAID' } }
}));`,
        pseudoCodePython:`# DynamoDB single-table design (Python boto3)
import boto3
dynamo = boto3.resource('dynamodb')
table = dynamo.Table('AppTable')
# Write item (PK = 'USER#<id>', SK = 'PROFILE')
table.put_item(Item={
    'PK': f'USER#{user_id}',
    'SK': 'PROFILE',
    'name': name,
    'email': email,
    'ttl':  int(time.time()) + 86400 * 30
})
# Read item
result = table.get_item(
    Key={'PK': f'USER#{user_id}', 'SK': 'PROFILE'}
)['Item']` },

      sqs:     {id:'sqs',     icon:'inbox',     label:'SQS Queue',         left:'76%',top:'50%', title:'Managed Message Queue',
        descBeginner:'A waiting room for slow tasks. When your function needs to do something heavy, it drops a message here and responds instantly — the work happens later.',
        descPro:'AWS SQS standard queue with configurable visibility timeout and dead-letter-queue (DLQ) redrive policy for failed message handling after max retries.',
        details:['Visibility Timeout','Dead-Letter Queue','At-Least-Once Delivery'],
        pseudoCode:`// SQS Send Message (Node.js)
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({});

await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.QUEUE_URL,
  MessageBody: JSON.stringify({ task: 'cleanup' })
}));`,
        pseudoCodePython:`# Send to SQS + DLQ redrive policy (boto3)
import boto3, json
sqs = boto3.client('sqs')
# Enqueue heavy job
sqs.send_message(
    QueueUrl=os.environ['SQS_URL'],
    MessageBody=json.dumps({ 'job': 'resize-image', 'key': s3_key }),
    DelaySeconds=0
)
# CDK: set DLQ redrive after 3 failures
queue = sqs_cdk.Queue(self, 'Q',
    dead_letter_queue=sqs_cdk.DeadLetterQueue(
        max_receive_count=3,
        queue=dlq
    ))` },

      stream:  {id:'stream',  icon:'activity',  label:'DynamoDB Streams',  left:'76%',top:'72%', title:'Change-Data-Capture Stream',
        descBeginner:'An alarm system on the database. Every time a record changes, a copy of the before and after is streamed so other functions can react automatically.',
        descPro:'DynamoDB Streams CDC feed delivering ordered item-level change records (NEW_AND_OLD_IMAGES) to downstream Lambda triggers with exactly-once shard processing.',
        details:['NEW_AND_OLD_IMAGES','Shard-Based Ordering','Lambda Trigger Integration'],
        pseudoCode:`// DynamoDB Stream Trigger (Node.js)
export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const newItem = record.dynamodb.NewImage;
      await processItem(newItem);
    }
  }
};`,
        pseudoCodePython:`# Lambda function triggered by DynamoDB Stream
def handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'INSERT':
            new = record['dynamodb']['NewImage']
            process_new_user({
                'id':    new['PK']['S'].replace('USER#',''),
                'email': new['email']['S']
            })
        elif record['eventName'] == 'MODIFY':
            old = record['dynamodb']['OldImage']
            new = record['dynamodb']['NewImage']
            on_field_change(old, new)` },
    },
    lines:[
      {id:'s1',from:'client',to:'gateway'},{id:'s2',from:'gateway',to:'lambda'},
      {id:'s3',from:'lambda',to:'dynamo'}, {id:'s4',from:'lambda',to:'sqs'},
      {id:'s5',from:'dynamo',to:'stream'},
    ],
    simulate:[
      {from:'client',to:'gateway',  type:'request',   dur:500, logBeginner:'User triggers an action in the browser.',logPro:'SPA dispatches SigV4-signed HTTP POST to API Gateway endpoint.'},
      {node:'gateway', process:true,dur:350, logBeginner:'Gateway validates identity and throttles requests.',logPro:'JWT authoriser validated — throttle counter checked — Lambda proxy invoked.'},
      {from:'gateway',to:'lambda',  type:'request',   dur:700, logBeginner:'Code waking up from cold sleep.',logPro:'Firecracker MicroVM cold-starting — runtime initialising environment.'},
      {node:'lambda',  process:true,dur:600, logBeginner:'Function running your business logic.',logPro:'Handler executing business logic — DynamoDB SDK client initialised in warm context.'},
      {from:'lambda',to:'dynamo',   type:'request',   dur:500, logBeginner:'Saving data to the NoSQL database.',logPro:'PutItem dispatched via DynamoDB SDK — partition-key hash routed to storage shard.'},
      {node:'dynamo',  process:true,dur:350, logBeginner:'Data stored instantly.',logPro:'Write acknowledged to majority of replica nodes — single-digit ms latency.'},
      {from:'dynamo',to:'stream',   type:'background',dur:600, logBeginner:'Database change triggers a stream event.',logPro:'NEW_AND_OLD_IMAGES CDC record emitted to DynamoDB Streams shard.'},
      {node:'stream',  process:true,dur:350, logBeginner:'Stream event ready for downstream processing.',logPro:'Lambda trigger polls shard — batch of change records dispatched for processing.'},
      {from:'lambda',to:'sqs',      type:'background',dur:500, logBeginner:'Slow task queued for later.',logPro:'Heavy async job serialised and enqueued to SQS standard queue — visibility timeout set.'},
      {node:'sqs',     process:true,dur:300, logBeginner:'Task waiting in queue.',logPro:'Message persisted durably across AZs — consumer Lambda will poll on next batch window.'},
      {from:'lambda',to:'gateway',  type:'response',  dur:400, logBeginner:'Function finished — going back to sleep.',logPro:'Handler returns 200 payload — Firecracker container frozen, not terminated.'},
      {from:'gateway',to:'client',  type:'response',  dur:400, logBeginner:'Instant response back to browser!',logPro:'API Gateway serialises response; client receives 200 OK with result payload.'},
    ],
  },
};
