#!/usr/bin/env node

/**
 * Generate Language and Version Report using SonarQube MCP Server
 * 
 * This script queries the SonarQube MCP Server to get:
 * - Languages used in the project
 * - Lines of code per language
 * - Project component details
 */

const { spawn } = require('child_process');
const fs = require('fs');

class MCPClient {
  constructor(config) {
    this.config = config;
  }

  /**
   * Query the MCP Server using JSON-RPC 2.0 protocol
   */
  async queryMCPServer(toolName, params = {}) {
    return new Promise((resolve, reject) => {
      console.error(`🔍 Querying MCP Server: ${toolName}...`);
      
      const mcpServer = spawn('java', ['-jar', this.config.jarPath], {
        env: {
          ...process.env,
          SONAR_TOKEN: this.config.token,
          SONAR_HOST_URL: this.config.host,
          SONAR_ORGANIZATION: this.config.organization
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let responseBuffer = '';
      let errorBuffer = '';
      
      mcpServer.stdout.on('data', (data) => {
        responseBuffer += data.toString();
      });
      
      mcpServer.stderr.on('data', (data) => {
        errorBuffer += data.toString();
      });
      
      // Wait for server to initialize
      setTimeout(() => {
        const request = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: params
          }
        };
        
        mcpServer.stdin.write(JSON.stringify(request) + '\n');
        
        // Wait for response
        setTimeout(() => {
          mcpServer.kill();
          
          if (errorBuffer) {
            console.error('MCP Server stderr:', errorBuffer);
          }
          
          try {
            // Try to parse the response
            const lines = responseBuffer.split('\n').filter(line => line.trim());
            let result = null;
            
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.result) {
                  result = parsed.result;
                  break;
                }
              } catch (e) {
                // Not JSON, continue
              }
            }
            
            if (result) {
              resolve(result);
            } else {
              reject(new Error('No valid response from MCP server'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse MCP response: ${e.message}`));
          }
        }, 5000);
      }, 2000);
      
      mcpServer.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get list of languages from SonarQube
   */
  async getLanguages() {
    try {
      const response = await this.queryMCPServer('list_languages', {});
      return response;
    } catch (error) {
      console.error('❌ Error fetching languages:', error.message);
      return null;
    }
  }

  /**
   * Get component measures including language breakdown
   */
  async getComponentMeasures(component, metricKeys) {
    try {
      const response = await this.queryMCPServer('get_component_measures', {
        component: component,
        metricKeys: metricKeys
      });
      return response;
    } catch (error) {
      console.error('❌ Error fetching measures:', error.message);
      return null;
    }
  }

  /**
   * Search for projects to get language distribution
   */
  async searchProjects() {
    try {
      const response = await this.queryMCPServer('search_my_sonarqube_projects', {});
      return response;
    } catch (error) {
      console.error('❌ Error searching projects:', error.message);
      return null;
    }
  }
}

/**
 * Generate comprehensive language report
 */
async function generateLanguageReport() {
  const config = {
    jarPath: process.env.MCP_JAR_PATH || 'sonarqube-mcp-server.jar',
    token: process.env.SONAR_TOKEN,
    host: process.env.SONAR_HOST_URL || 'https://sonarcloud.io',
    organization: process.env.SONAR_ORGANIZATION,
    projectKey: process.env.SONAR_PROJECT_KEY
  };

  if (!config.token || !config.projectKey) {
    console.error('❌ Error: SONAR_TOKEN and SONAR_PROJECT_KEY are required');
    process.exit(1);
  }

  const client = new MCPClient(config);

  console.error('🤖 Starting SonarQube MCP Server Language Analysis...\n');

  try {
    // Query 1: Get all supported languages
    console.error('📋 Step 1: Fetching supported languages...');
    const languages = await client.getLanguages();

    // Query 2: Get project measures with language breakdown
    console.error('📋 Step 2: Fetching project metrics...');
    const measures = await client.getComponentMeasures(config.projectKey, [
      'ncloc',
      'ncloc_language_distribution',
      'languages',
      'files',
      'lines',
      'coverage',
      'duplicated_lines_density'
    ]);

    // Query 3: Search project details
    console.error('📋 Step 3: Fetching project details...');
    const projects = await client.searchProjects();
    const projectDetails = projects?.components?.find(p => p.key === config.projectKey);

    console.error('✅ All data retrieved from MCP Server\n');

    // Generate the report
    const report = {
      projectKey: config.projectKey,
      projectName: projectDetails?.name || config.projectKey,
      organization: config.organization,
      analysisDate: new Date().toISOString(),
      languages: {},
      metrics: {},
      supportedLanguages: []
    };

    // Process language distribution
    if (measures?.component?.measures) {
      for (const measure of measures.component.measures) {
        if (measure.metric === 'ncloc_language_distribution') {
          // Parse language distribution (e.g., "js=1234;py=567")
          const langDist = measure.value.split(';');
          for (const lang of langDist) {
            const [langKey, loc] = lang.split('=');
            report.languages[langKey] = {
              key: langKey,
              linesOfCode: parseInt(loc, 10)
            };
          }
        } else {
          report.metrics[measure.metric] = measure.value;
        }
      }
    }

    // Add supported languages info
    if (languages?.languages) {
      report.supportedLanguages = languages.languages.map(lang => ({
        key: lang.key,
        name: lang.name
      }));
      
      // Enrich project languages with full names
      for (const langKey in report.languages) {
        const langInfo = languages.languages.find(l => l.key === langKey);
        if (langInfo) {
          report.languages[langKey].name = langInfo.name;
        }
      }
    }

    // Output the report as JSON
    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateLanguageReport();
}

module.exports = { MCPClient, generateLanguageReport };

