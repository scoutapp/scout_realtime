class Scout::Realtime::Processes < Scout::Realtime::Metric
  include Scout::Realtime::MultiAggregator

  FIELDS = { :cpu              => {'label'=>'CPU usage', 'units'=>'', 'precision'=>2},
             :memory           => {'units'=>'MB', 'precision'=>1},
             :count            => {'units'=>'', 'precision'=>0}
           }

  def initialize
    @collector = ServerMetrics::Processes.new()
    super
  end

  def latest_run
    top_memory_processes = get_top_processes(@latest_run, :memory, 10)
    top_cpu_processes = get_top_processes(@latest_run, :cpu, 10)

    @latest_run.select { |cmd, values| (top_memory_processes + top_cpu_processes).include?(cmd) }
  end
  
  private
    def get_top_processes(data, order_by, num)
      data.values.sort { |a, b| a[order_by] <=> b[order_by] }.reverse[0...num].map { |values| values[:cmd] }
    end
end
