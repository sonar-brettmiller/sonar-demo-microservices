#!/usr/bin/env node

/**
 * Fetch real SonarQube issues for PR decoration
 * This script uses the SonarCloud API directly to get actual issues
 * No mocks, no simulations - 100% real data
 */

const axios = require('axios');

async function getQualityGateStatus(projectKey) {
    const SONAR_HOST_URL = process.env.SONAR_HOST_URL || 'https://sonarcloud.io';
    const SONAR_TOKEN = process.env.SONAR_TOKEN;
    const SONAR_ORGANIZATION = process.env.SONAR_ORGANIZATION;

    if (!SONAR_TOKEN || !SONAR_ORGANIZATION || !projectKey) {
        throw new Error('Missing required environment variables');
    }

    const url = `${SONAR_HOST_URL}/api/qualitygates/project_status`;
    const params = {
        projectKey: projectKey
    };

    try {
        const response = await axios.get(url, {
            params: params,
            auth: {
                username: SONAR_TOKEN,
                password: ''
            }
        });
        return response.data.projectStatus;
    } catch (error) {
        console.error('Error fetching quality gate:', error.message);
        throw error;
    }
}

async function searchSonarIssues(projectKey) {
    const SONAR_HOST_URL = process.env.SONAR_HOST_URL || 'https://sonarcloud.io';
    const SONAR_TOKEN = process.env.SONAR_TOKEN;

    const url = `${SONAR_HOST_URL}/api/issues/search`;
    const params = {
        componentKeys: projectKey,
        resolved: false,
        ps: 500 // Get up to 500 issues
    };

    try {
        const response = await axios.get(url, {
            params: params,
            auth: {
                username: SONAR_TOKEN,
                password: ''
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching issues:', error.message);
        throw error;
    }
}

async function getRuleDetails(ruleKey) {
    const SONAR_HOST_URL = process.env.SONAR_HOST_URL || 'https://sonarcloud.io';
    const SONAR_TOKEN = process.env.SONAR_TOKEN;

    const url = `${SONAR_HOST_URL}/api/rules/show`;
    const params = {
        key: ruleKey
    };

    try {
        const response = await axios.get(url, {
            params: params,
            auth: {
                username: SONAR_TOKEN,
                password: ''
            }
        });
        return response.data.rule;
    } catch (error) {
        console.error(`Error fetching rule ${ruleKey}:`, error.message);
        return null;
    }
}

async function main() {
    try {
        const projectKey = process.env.SONAR_PROJECT_KEY;
        
        if (!projectKey) {
            throw new Error('SONAR_PROJECT_KEY environment variable is required');
        }

        console.error('🔍 Fetching quality gate status from SonarCloud...');
        const qualityGate = await getQualityGateStatus(projectKey);

        console.error('🔍 Fetching all issues from SonarCloud...');
        const issuesData = await searchSonarIssues(projectKey);

        console.error(`📊 Found ${issuesData.issues.length} issues`);

        // Get rule details for unique rules (to provide better fix recommendations)
        const uniqueRules = [...new Set(issuesData.issues.map(i => i.rule))];
        console.error(`📋 Fetching details for ${uniqueRules.length} unique rules...`);
        
        const rules = {};
        for (const ruleKey of uniqueRules.slice(0, 20)) { // Limit to avoid rate limiting
            const ruleDetails = await getRuleDetails(ruleKey);
            if (ruleDetails) {
                rules[ruleKey] = ruleDetails;
            }
        }

        const result = {
            projectKey: projectKey,
            qualityGate: qualityGate,
            issues: issuesData.issues.map(issue => ({
                key: issue.key,
                rule: issue.rule,
                severity: issue.severity,
                component: issue.component,
                line: issue.line,
                message: issue.message,
                type: issue.type,
                status: issue.status,
                textRange: issue.textRange,
                flows: issue.flows
            })),
            rules: rules,
            components: issuesData.components || []
        };

        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Failed to fetch data:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

