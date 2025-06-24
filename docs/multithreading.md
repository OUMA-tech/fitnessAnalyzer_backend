# 多线程处理指南

本文档介绍如何在后端项目中实现和使用多线程处理。

## 概述

项目提供了多种多线程处理方案：

1. **BullMQ 并发处理** - 基于队列的并发任务处理
2. **Worker Threads** - Node.js 内置多线程支持
3. **Cluster** - 多进程模式
4. **自定义多线程服务** - 灵活的任务处理服务

## 1. BullMQ 并发处理

### 配置并发工作器

```typescript
// 在 subscriptionWorker.ts 中
export const createSubscriptionWorker = (redisClient: Redis) => {
   return new Worker('subscriptionQueue', async (job: Job<SubscriptionJob>) => {
     // 处理逻辑
   }, 
   { 
     connection: redisClient,
     concurrency: 5, // 并发处理5个任务
     removeOnComplete: { count: 100 },
     removeOnFail: { count: 50 },
   });
};
```

### 使用方式

```typescript
// 添加任务到队列
await enqueueSubscriptionSync(subscriptionQueue, subscriptionId, userId);
```

## 2. Worker Threads

### 基本使用

```typescript
import { workerManager } from '../worker/worker';

// 处理单个任务
const result = await workerManager.createWorker('subscription-sync', {
  subscriptionId: 'sub_123',
  userId: 'user_456'
});

// 批量处理
const tasks = [
  { type: 'data-processing', data: [1, 2, 3] },
  { type: 'email-send', data: { to: 'user@example.com' } }
];

const results = await workerManager.processBatch(tasks);
```

### 支持的任务类型

- `subscription-sync` - 订阅同步
- `email-send` - 邮件发送
- `data-processing` - 数据处理

## 3. Cluster 多进程

### 启动集群

```typescript
import { clusterManager } from '../worker/cluster';

// 启动集群（使用所有CPU核心）
await clusterManager.startCluster();

// 获取集群状态
const status = clusterManager.getClusterStatus();
```

### 环境变量配置

```bash
# 启用集群模式
ENABLE_CLUSTER=true npm run worker:cluster
```

## 4. 自定义多线程服务

### 基本使用

```typescript
import { multithreadService } from '../services/multithread/multithreadService';

// 添加单个任务
multithreadService.addTask({
  id: 'task-1',
  type: 'calculation',
  data: [1, 2, 3, 4, 5],
  priority: 2
});

// 批量添加任务
multithreadService.addTasks([
  { id: 'task-1', type: 'data-processing', data: [...] },
  { id: 'task-2', type: 'file-processing', data: [...] }
]);

// 监听事件
multithreadService.on('taskCompleted', (result) => {
  console.log(`Task ${result.taskId} completed in ${result.duration}ms`);
});

multithreadService.on('taskFailed', (result) => {
  console.error(`Task ${result.taskId} failed: ${result.error}`);
});
```

### 支持的任务类型

- `data-processing` - 数据处理
- `calculation` - CPU密集型计算
- `file-processing` - 文件处理

## 5. API 接口

### 处理单个任务

```bash
POST /api/multithread/task
Content-Type: application/json

{
  "type": "calculation",
  "data": [1, 2, 3, 4, 5],
  "priority": 2
}
```

### 批量处理任务

```bash
POST /api/multithread/batch
Content-Type: application/json

{
  "tasks": [
    { "type": "data-processing", "data": [...] },
    { "type": "file-processing", "data": [...] }
  ]
}
```

### 获取服务状态

```bash
GET /api/multithread/status
```

### 处理计算任务

```bash
POST /api/multithread/calculation
Content-Type: application/json

{
  "numbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

### 处理文件任务

```bash
POST /api/multithread/files
Content-Type: application/json

{
  "files": [
    { "name": "file1.txt", "content": "..." },
    { "name": "file2.txt", "content": "..." }
  ]
}
```

## 6. 启动脚本

### 启动工作器

```bash
# 开发模式
npm run worker:dev

# 生产模式
npm run worker

# 集群模式
npm run worker:cluster
```

## 7. 最佳实践

### 选择合适的方案

1. **I/O 密集型任务** - 使用 BullMQ 并发处理
2. **CPU 密集型任务** - 使用 Worker Threads 或 Cluster
3. **复杂数据处理** - 使用自定义多线程服务

### 性能优化

1. **合理设置并发数** - 根据CPU核心数和任务类型调整
2. **任务优先级** - 为重要任务设置更高优先级
3. **资源清理** - 及时清理完成的任务和关闭工作线程
4. **错误处理** - 实现完善的错误处理和重试机制

### 监控和调试

1. **事件监听** - 监听任务完成和失败事件
2. **状态监控** - 定期检查服务状态
3. **日志记录** - 记录详细的处理日志
4. **性能指标** - 监控处理时间和吞吐量

## 8. 注意事项

1. **内存管理** - 避免在Worker Threads中传递大量数据
2. **错误传播** - 确保错误能够正确传播到主线程
3. **资源竞争** - 避免多个线程同时访问共享资源
4. **优雅关闭** - 实现优雅的关闭机制

## 9. 故障排除

### 常见问题

1. **Worker Threads 无法启动**
   - 检查 Node.js 版本（需要 10.5.0+）
   - 确认文件路径正确

2. **内存泄漏**
   - 检查是否正确清理工作线程
   - 监控内存使用情况

3. **任务卡死**
   - 设置任务超时时间
   - 实现任务取消机制

### 调试技巧

1. 使用 `console.log` 在工作线程中输出调试信息
2. 监听 `error` 和 `exit` 事件
3. 使用 Node.js 调试器
4. 监控系统资源使用情况 