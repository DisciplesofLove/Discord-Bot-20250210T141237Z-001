const config = require('../../config/ai').compute;

class ResourceManager {
    constructor() {
        this.resources = {
            cpu: {
                total: process.env.CPU_CORES || 4,
                used: 0
            },
            memory: {
                total: process.env.MEMORY_GB || 16,
                used: 0
            },
            jobs: []
        };
    }

    async checkAvailability(jobConfig) {
        const requiredCores = jobConfig.cores || config.minCpuCores;
        const requiredMemory = jobConfig.memory || config.minMemoryGb;

        const availableCores = this.resources.cpu.total - this.resources.cpu.used;
        const availableMemory = this.resources.memory.total - this.resources.memory.used;

        return {
            available: availableCores >= requiredCores && availableMemory >= requiredMemory,
            resources: {
                cpu: {
                    available: availableCores,
                    required: requiredCores
                },
                memory: {
                    available: availableMemory,
                    required: requiredMemory
                }
            }
        };
    }

    async executeCompute(job) {
        try {
            // Allocate resources
            await this.allocateResources(job);

            // Simulate computation time
            await this.simulateComputation(job);

            // Generate mock results
            const result = await this.generateResults(job);

            // Release resources
            await this.releaseResources(job);

            return result;
        } catch (error) {
            await this.releaseResources(job);
            throw error;
        }
    }

    async allocateResources(job) {
        const cores = job.config.cores || config.minCpuCores;
        const memory = job.config.memory || config.minMemoryGb;

        if (this.resources.cpu.used + cores > this.resources.cpu.total ||
            this.resources.memory.used + memory > this.resources.memory.total) {
            throw new Error('Insufficient resources');
        }

        this.resources.cpu.used += cores;
        this.resources.memory.used += memory;
        this.resources.jobs.push(job.id);
    }

    async releaseResources(job) {
        const cores = job.config.cores || config.minCpuCores;
        const memory = job.config.memory || config.minMemoryGb;

        this.resources.cpu.used = Math.max(0, this.resources.cpu.used - cores);
        this.resources.memory.used = Math.max(0, this.resources.memory.used - memory);
        this.resources.jobs = this.resources.jobs.filter(id => id !== job.id);
    }

    async getMetrics() {
        return {
            utilization: {
                cpu: (this.resources.cpu.used / this.resources.cpu.total) * 100,
                memory: (this.resources.memory.used / this.resources.memory.total) * 100
            },
            available: {
                cpu: this.resources.cpu.total - this.resources.cpu.used,
                memory: this.resources.memory.total - this.resources.memory.used
            },
            activeJobs: this.resources.jobs.length
        };
    }

    async simulateComputation(job) {
        const duration = Math.min(
            job.config.expectedDuration || 5000,
            config.maxJobDuration
        );
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    async generateResults(job) {
        // Mock training results
        return {
            modelWeights: Array.from({ length: 1000 }, () => Math.random()),
            metrics: {
                loss: Math.random() * 0.5,
                accuracy: 0.85 + Math.random() * 0.1,
                epochs: job.config.epochs || 10
            },
            timestamp: Date.now()
        };
    }
}

module.exports = { ResourceManager };