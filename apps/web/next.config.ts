import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: [
    '@ai-agent-rpg/content',
    '@ai-agent-rpg/domain',
    '@ai-agent-rpg/evaluator',
    '@ai-agent-rpg/progression',
    '@ai-agent-rpg/runtime'
  ]
}

export default nextConfig
