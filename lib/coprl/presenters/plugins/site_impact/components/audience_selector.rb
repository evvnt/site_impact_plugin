# frozen_string_literal: true

module Coprl
  module Presenters
    module Plugins
      module SiteImpact
        module Components
          class AudienceSelector < DSL::Components::EventBase
            attr_reader :audience_options

            def initialize(**attribs, &block)
              @audience_option = attribs.delete(:audience_options){ {} }
              super(type: :audience_selector, **attribs, &block)
              expand!
            end
          end
        end
      end
    end
  end
end
