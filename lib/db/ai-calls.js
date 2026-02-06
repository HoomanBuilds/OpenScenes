"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAICallsTable = initAICallsTable;
exports.logAICall = logAICall;
exports.getAICallStats = getAICallStats;
exports.getJobAICalls = getJobAICalls;
var postgres_1 = require("./postgres");
function initAICallsTable() {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, postgres_1.pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 7, 8]);
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS ai_calls (\n        id SERIAL PRIMARY KEY,\n        job_id VARCHAR(64),\n        trace_id VARCHAR(64),\n        agent_type VARCHAR(50) NOT NULL,\n        model VARCHAR(100) NOT NULL,\n        operation VARCHAR(50) NOT NULL,\n        input_tokens INTEGER,\n        output_tokens INTEGER,\n        total_tokens INTEGER,\n        latency_ms INTEGER,\n        status VARCHAR(20) NOT NULL DEFAULT 'success',\n        error TEXT,\n        metadata JSONB,\n        created_at TIMESTAMP DEFAULT NOW()\n      )\n    ")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, client.query("\n      CREATE INDEX IF NOT EXISTS idx_ai_calls_job_id ON ai_calls(job_id)\n    ")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, client.query("\n      CREATE INDEX IF NOT EXISTS idx_ai_calls_agent_type ON ai_calls(agent_type)\n    ")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, client.query("\n      CREATE INDEX IF NOT EXISTS idx_ai_calls_created_at ON ai_calls(created_at)\n    ")];
                case 6:
                    _a.sent();
                    console.log('[DB] ai_calls table initialized');
                    return [3 /*break*/, 8];
                case 7:
                    client.release();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function logAICall(record) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, postgres_1.pool.query("INSERT INTO ai_calls (\n      job_id, trace_id, agent_type, model, operation,\n      input_tokens, output_tokens, total_tokens,\n      latency_ms, status, error, metadata\n    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)\n    RETURNING id", [
                        record.jobId || null,
                        record.traceId || null,
                        record.agentType,
                        record.model,
                        record.operation,
                        record.inputTokens || null,
                        record.outputTokens || null,
                        record.totalTokens || null,
                        record.latencyMs,
                        record.status,
                        record.error || null,
                        record.metadata ? JSON.stringify(record.metadata) : null,
                    ])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.rows[0].id];
            }
        });
    });
}
function getAICallStats(startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var whereClause, params, statsResult, agentResult, callsByAgent, _i, _a, row, stats;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    whereClause = startDate && endDate
                        ? 'WHERE created_at BETWEEN $1 AND $2'
                        : '';
                    params = startDate && endDate ? [startDate, endDate] : [];
                    return [4 /*yield*/, postgres_1.pool.query("\n    SELECT \n      COUNT(*) as total_calls,\n      COALESCE(SUM(total_tokens), 0) as total_tokens,\n      COALESCE(AVG(latency_ms), 0) as avg_latency,\n      COUNT(CASE WHEN status = 'success' THEN 1 END)::float / NULLIF(COUNT(*), 0) as success_rate\n    FROM ai_calls ".concat(whereClause, "\n  "), params)];
                case 1:
                    statsResult = _b.sent();
                    return [4 /*yield*/, postgres_1.pool.query("\n    SELECT agent_type, COUNT(*) as count\n    FROM ai_calls ".concat(whereClause, "\n    GROUP BY agent_type\n  "), params)];
                case 2:
                    agentResult = _b.sent();
                    callsByAgent = {};
                    for (_i = 0, _a = agentResult.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        callsByAgent[row.agent_type] = parseInt(row.count, 10);
                    }
                    stats = statsResult.rows[0];
                    return [2 /*return*/, {
                            totalCalls: parseInt(stats.total_calls, 10),
                            totalTokens: parseInt(stats.total_tokens, 10),
                            avgLatencyMs: Math.round(parseFloat(stats.avg_latency)),
                            successRate: parseFloat(stats.success_rate) || 0,
                            callsByAgent: callsByAgent,
                        }];
            }
        });
    });
}
function getJobAICalls(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, postgres_1.pool.query("SELECT * FROM ai_calls WHERE job_id = $1 ORDER BY created_at", [jobId])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.rows.map(function (row) { return ({
                            jobId: row.job_id,
                            traceId: row.trace_id,
                            agentType: row.agent_type,
                            model: row.model,
                            operation: row.operation,
                            inputTokens: row.input_tokens,
                            outputTokens: row.output_tokens,
                            totalTokens: row.total_tokens,
                            latencyMs: row.latency_ms,
                            status: row.status,
                            error: row.error,
                            metadata: row.metadata,
                        }); })];
            }
        });
    });
}
