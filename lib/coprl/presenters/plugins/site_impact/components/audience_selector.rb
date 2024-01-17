# frozen_string_literal: true
require 'coprl/presenters/dsl/components/event_base'

module Coprl
  module Presenters
    module Plugins
      module SiteImpact
        module Components
          class AudienceSelector < DSL::Components::EventBase
            attr_reader :audience_options, :zip_code, :cpm, :max_radius, :min_audience_selection, :max_audience_selection,
                        :selected_count_id, :selected_audience_size

            def initialize(**attribs, &block)
              @audience_options = attribs.delete(:audience_options){ [] }
              @zip_code = attribs.delete(:zip_code)
              @cpm = attribs.delete(:cpm)
              @max_radius = attribs.delete(:max_radius)
              @selected_count_id = attribs.delete(:selected_count_id)
              @min_audience_selection = attribs.delete(:min_audience_selection){ 1 }
              @max_audience_selection = attribs.delete(:max_audience_selection){ @audience_options.size - 1 }
              @selected_audience_size = attribs.delete(:selected_audience_size){ @min_audience_size }
              super(type: :audience_selector, **attribs, &block)
              expand!
            end

            def slider_selection
              @audience_options.index{|e| e[:count] == @selected_audience_size}
            end
          end
        end
      end
    end
  end
end
