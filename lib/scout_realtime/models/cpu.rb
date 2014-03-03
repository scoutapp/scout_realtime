class Scout::Realtime::Cpu < Scout::Realtime::Metric
  include Scout::Realtime::Aggregator

  FIELDS = { :user                  => { 'units' => '%', 'precision' => 1 },
             :system                => { 'units' => '%', 'precision' => 1 },
             :idle                  => { 'units' => '%', 'precision' => 1 },
             :io_wait               => { 'units' => '%', 'precision' => 1, 'label' => 'IO Wait' },
             :steal                 => { 'units' => '%', 'precision' => 1 },
             :interrupts            => { 'units' => '/sec', 'precision' => 1 },
             :procs_running         => { 'units' => '', 'precision' => 0 },
             :procs_blocked         => { 'units' => '', 'precision' => 0 }
          }

  def initialize
    # load average metrics aren't displayed in scout_realtime and the call to grab this is a system call,
    # which is slow. avoids this.
    @collector = ServerMetrics::Cpu.new(:skip_load => true)
    super
  end
end
