# frozen_string_literal: true

require_relative "lib/site_impact_plugin/version"

Gem::Specification.new do |spec|
  spec.name = "site_impact_plugin"
  spec.version = SiteImpactPlugin::VERSION
  spec.authors = ["Derek Graham"]
  spec.email = ["derek@evvnt.com"]

  spec.summary = "A COPRL plugin that provides an audience selector and email editor for a SiteImpact email campaign"
  spec.homepage = "https://github.com/evvnt/site_impact_plugin"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 2.6.0"

  spec.metadata["allowed_push_host"] = "https://github.com/evvnt/site_impact_plugin"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/evvnt/site_impact_plugin"
  spec.metadata["changelog_uri"] = "https://github.com/evvnt/site_impact_plugin/releases"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features)/|\.(?:git|travis|circleci)|appveyor)})
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
  spec.add_runtime_dependency 'dry-configurable', '>0.1', '<= 7.0'

  spec.add_development_dependency "bundler", "~> 2.0"

  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html
end
