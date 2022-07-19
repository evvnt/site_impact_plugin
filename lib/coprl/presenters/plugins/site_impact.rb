# frozen_string_literal: true

require_relative 'site_impact/components/audience_selector'

module Coprl
  module Presenters
    module Plugins
      module SiteImpact

        module DSLComponents
          def audience_selector(**attributes, &block)
            self << SiteImpact::Components::AudienceSelector.new(parent: self, **attributes, &block)
          end
        end

        module WebClientComponents

          def view_dir_audience_selector(_pom)
            File.join(__dir__, '../../../..', 'views', 'components')
          end

          def render_header_audience_selector(pom, render:)
            render.call :erb, :audience_selector_header, views: view_dir_audience_selector(pom)
          end

          def render_audience_selector(comp,
                                       render:,
                                       components:,
                                       index:)
            render.call :erb, :audience_selector, views: view_dir_audience_selector(comp),
                        locals: {comp: comp,
                                 components: components,
                                 index: index}
          end
        end

      end
    end
  end
end
