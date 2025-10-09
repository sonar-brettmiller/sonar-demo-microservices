#!/usr/bin/env node

/**
 * SonarQube MCP Client
 * 
 * This script implements a real MCP client that queries SonarCloud/SonarQube API
 * to retrieve quality gate status, issues, and metrics for a project.
 */

const https = require('https');
const http = require('http');

class SonarQubeMCPClient {
  constructor(config) {
    this.host = config.host || 'sonarcloud.io';
    this.organization = config.organization;
    this.projectKey = config.projectKey;
    this.token = config.token;
    this.branch = config.branch;
    this.isCloud = this.host.includes('sonarcloud.io');
  }

  /**
   * Make authenticated request to SonarQube API
   */
  async request(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      const queryParams = new URLSearchParams(params);
      const path = `/api${endpoint}?${queryParams.toString()}`;
      
      const options = {
        hostname: this.host,
        path: path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      };

      const protocol = this.host.includes('https') || this.isCloud ? https : http;
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve(data);
            }
          } else {
            reject(new Error(`API request failed: ${res.statusCode} - ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
  }

  /**
   * MCP Tool: Get Quality Gate Status
   */
  async getQualityGateStatus() {
    console.error('🔍 Fetching quality gate status from SonarQube...');
    
    try {
      const params = {
        projectKey: this.projectKey
      };
      
      if (this.branch) {
        params.branch = this.branch;
      }
      
      const response = await this.request('/qualitygates/project_status', params);
      
      return {
        projectKey: this.projectKey,
        branch: this.branch || 'main',
        qualityGate: {
          status: response.projectStatus.status,
          conditions: response.projectStatus.conditions.map(c => ({
            metric: c.metricKey,
            status: c.status,
            actualValue: c.actualValue,
            errorThreshold: c.errorThreshold,
            comparator: c.comparator,
            description: this.getConditionDescription(c)
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error fetching quality gate:', error.message);
      throw error;
    }
  }

  /**
   * MCP Tool: Get Issues
   */
  async getIssues(options = {}) {
    console.error('🔍 Fetching issues from SonarQube...');
    
    try {
      const params = {
        componentKeys: this.projectKey,
        resolved: 'false',
        ps: options.pageSize || 500, // Page size
        p: options.page || 1
      };
      
      if (this.branch) {
        params.branch = this.branch;
      }
      
      if (options.severities) {
        params.severities = options.severities.join(',');
      }
      
      if (options.types) {
        params.types = options.types.join(',');
      }
      
      const response = await this.request('/issues/search', params);
      
      return {
        total: response.total,
        issues: response.issues.map(issue => ({
          key: issue.key,
          rule: issue.rule,
          severity: issue.severity,
          component: issue.component,
          line: issue.line,
          message: issue.message,
          type: issue.type,
          status: issue.status,
          effort: issue.effort,
          debt: issue.debt,
          tags: issue.tags
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching issues:', error.message);
      throw error;
    }
  }

  /**
   * MCP Tool: Get Metrics
   */
  async getMetrics(metricKeys) {
    console.error('🔍 Fetching metrics from SonarQube...');
    
    try {
      const defaultMetrics = [
        'bugs',
        'vulnerabilities',
        'code_smells',
        'coverage',
        'duplicated_lines_density',
        'ncloc',
        'sqale_index',
        'alert_status',
        'reliability_rating',
        'security_rating',
        'sqale_rating',
        'security_hotspots',
        'security_review_rating'
      ];
      
      const params = {
        component: this.projectKey,
        metricKeys: (metricKeys || defaultMetrics).join(',')
      };
      
      if (this.branch) {
        params.branch = this.branch;
      }
      
      const response = await this.request('/measures/component', params);
      
      const metrics = {};
      response.component.measures.forEach(measure => {
        metrics[measure.metric] = measure.value;
      });
      
      return metrics;
    } catch (error) {
      console.error('❌ Error fetching metrics:', error.message);
      throw error;
    }
  }

  /**
   * MCP Tool: Get Project Health (Combined)
   */
  async getProjectHealth() {
    console.error('🔍 Fetching complete project health from SonarQube...');
    
    try {
      const [qualityGate, issues, metrics] = await Promise.all([
        this.getQualityGateStatus(),
        this.getIssues({ severities: ['BLOCKER', 'CRITICAL', 'MAJOR'] }),
        this.getMetrics()
      ]);
      
      return {
        projectKey: this.projectKey,
        branch: this.branch || 'main',
        qualityGate: qualityGate.qualityGate,
        metrics: metrics,
        issues: issues.issues,
        summary: {
          totalIssues: issues.total,
          bugs: parseInt(metrics.bugs || 0),
          vulnerabilities: parseInt(metrics.vulnerabilities || 0),
          codeSmells: parseInt(metrics.code_smells || 0),
          coverage: parseFloat(metrics.coverage || 0),
          duplicatedLines: parseFloat(metrics.duplicated_lines_density || 0),
          technicalDebt: metrics.sqale_index,
          securityHotspots: parseInt(metrics.security_hotspots || 0)
        }
      };
    } catch (error) {
      console.error('❌ Error fetching project health:', error.message);
      throw error;
    }
  }

  /**
   * Helper: Generate human-readable condition description
   */
  getConditionDescription(condition) {
    const metricNames = {
      'new_coverage': 'Coverage on New Code',
      'new_duplicated_lines_density': 'Duplicated Lines on New Code',
      'new_maintainability_rating': 'Maintainability Rating on New Code',
      'new_reliability_rating': 'Reliability Rating on New Code',
      'new_security_rating': 'Security Rating on New Code',
      'new_security_hotspots_reviewed': 'Security Hotspots Reviewed on New Code',
      'coverage': 'Overall Coverage',
      'duplicated_lines_density': 'Duplicated Lines Density',
      'sqale_rating': 'Maintainability Rating',
      'reliability_rating': 'Reliability Rating',
      'security_rating': 'Security Rating',
      'security_hotspots_reviewed': 'Security Hotspots Reviewed'
    };
    
    const name = metricNames[condition.metricKey] || condition.metricKey;
    const actual = condition.actualValue;
    const threshold = condition.errorThreshold;
    const comparator = condition.comparator;
    
    let comparison = '';
    switch (comparator) {
      case 'GT': comparison = 'is greater than'; break;
      case 'LT': comparison = 'is less than'; break;
      case 'NE': comparison = 'is not equal to'; break;
      default: comparison = 'compared to';
    }
    
    return `${name}: ${actual} ${comparison} threshold ${threshold}`;
  }

  /**
   * Analyze PR Impact (simulate MCP tool)
   */
  async analyzePRImpact(pullRequestKey) {
    console.error('🔍 Analyzing PR impact...');
    
    try {
      // Get issues on the PR branch
      const issues = await this.getIssues({ 
        severities: ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR'],
        types: ['BUG', 'VULNERABILITY', 'CODE_SMELL']
      });
      
      // Get metrics for the PR branch
      const metrics = await this.getMetrics();
      
      return {
        pullRequest: pullRequestKey,
        impact: {
          newIssues: issues.issues.filter(i => i.status === 'OPEN').length,
          criticalIssues: issues.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'BLOCKER').length,
          coverageChange: metrics.new_coverage || 'N/A',
          rating: {
            reliability: metrics.new_reliability_rating || metrics.reliability_rating,
            security: metrics.new_security_rating || metrics.security_rating,
            maintainability: metrics.new_maintainability_rating || metrics.sqale_rating
          }
        },
        recommendations: this.generateRecommendations(issues.issues, metrics)
      };
    } catch (error) {
      console.error('❌ Error analyzing PR impact:', error.message);
      throw error;
    }
  }

  /**
   * Generate AI-powered recommendations
   */
  generateRecommendations(issues, metrics) {
    const recommendations = [];
    
    // Check for critical/blocker issues
    const criticalIssues = issues.filter(i => 
      i.severity === 'CRITICAL' || i.severity === 'BLOCKER'
    );
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        message: `Address ${criticalIssues.length} critical/blocker issue(s) before merging`,
        action: 'Fix critical issues immediately'
      });
    }
    
    // Check coverage
    const coverage = parseFloat(metrics.coverage || metrics.new_coverage || 0);
    if (coverage < 80) {
      recommendations.push({
        priority: 'MEDIUM',
        message: `Test coverage is ${coverage}%, below recommended 80%`,
        action: 'Add more unit tests to improve coverage'
      });
    }
    
    // Check security hotspots
    const hotspots = parseInt(metrics.security_hotspots || 0);
    if (hotspots > 0) {
      recommendations.push({
        priority: 'HIGH',
        message: `${hotspots} security hotspot(s) need review`,
        action: 'Review and address security hotspots'
      });
    }
    
    return recommendations;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const config = {
    host: process.env.SONAR_HOST_URL || 'sonarcloud.io',
    organization: process.env.SONAR_ORGANIZATION,
    projectKey: process.env.SONAR_PROJECT_KEY,
    token: process.env.SONAR_TOKEN,
    branch: process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME
  };
  
  if (!config.projectKey || !config.token) {
    console.error('❌ Error: SONAR_PROJECT_KEY and SONAR_TOKEN environment variables are required');
    process.exit(1);
  }
  
  const client = new SonarQubeMCPClient(config);
  
  try {
    let result;
    
    switch (command) {
      case 'quality-gate':
        result = await client.getQualityGateStatus();
        break;
        
      case 'issues':
        const severities = args[1] ? args[1].split(',') : undefined;
        result = await client.getIssues({ severities });
        break;
        
      case 'metrics':
        const metricKeys = args[1] ? args[1].split(',') : undefined;
        result = await client.getMetrics(metricKeys);
        break;
        
      case 'health':
        result = await client.getProjectHealth();
        break;
        
      case 'pr-impact':
        const prKey = args[1] || 'current';
        result = await client.analyzePRImpact(prKey);
        break;
        
      default:
        console.error('Usage: sonarqube-mcp-client.js <command> [options]');
        console.error('Commands:');
        console.error('  quality-gate    - Get quality gate status');
        console.error('  issues [sevs]   - Get issues (optional: BLOCKER,CRITICAL,MAJOR)');
        console.error('  metrics [keys]  - Get metrics (optional: comma-separated keys)');
        console.error('  health          - Get complete project health');
        console.error('  pr-impact [key] - Analyze PR impact');
        process.exit(1);
    }
    
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ MCP Client Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SonarQubeMCPClient;

