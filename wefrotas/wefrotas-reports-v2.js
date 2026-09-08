/* Read-only reporting: never mutates operational records. */
(() => {
  const titles = {
    overview: 'Visão geral de custos', monthly_vehicle_cost: 'Custos por veículo',
    fuel_register: 'Abastecimentos e consumo', irregularities: 'Irregularidades de abastecimento',
    orders: 'Ordens de serviço', maintenance_comparison: 'Manutenção preventiva × corretiva',
    availability: 'Disponibilidade da frota', vehicle_performance: 'Desempenho dos veículos',
    driver_performance: 'Desempenho dos motoristas', fines: 'Infrações e multas',
    finance_status: 'Despesas e pagamentos', supplier_ranking: 'Custos por fornecedor',
    deadlines: 'Pendências e vencimentos', record_audit: 'Auditoria de registros'
  };
  const oldBuild = buildReportData, oldTitle = getReportTitleByType, oldFilters = getReportFilters;
  const oldOrders = getFilteredReportOrders, oldContext = getReportDateContextLabel;
  if (typeof setFilterValue === 'function') {
    const originalSetFilterValue = setFilterValue;
    setFilterValue = (id, value) => {
      if (id === 'report-filter-type' && ['cost', 'fuel_liters_per_km'].includes(value)) {
        originalSetFilterValue('report-filter-fuel-view', value);
        value = 'fuel_register';
      }
      originalSetFilterValue(id, value);
      if (id === 'report-filter-type') {
        for (const [wrap, type] of [['report-situation-wrap','orders'],['report-horizon-wrap','deadlines'],['report-fuel-view-wrap','fuel_register']]) {
          const node = document.getElementById(wrap); if (node) node.hidden = value !== type;
        }
      }
    };
  }
  const cell = value => ({text: value === null || value === undefined || value === '' ? 'Não informado' : String(value)});
  const table = (filters, headers, values, note, summary = []) => ({
    title: titles[filters.type], meta: `Período: ${getReportPeriodLabel(filters)} • Veículo: ${getReportVehicleLabel(filters.vehicleId)} • ${note}`,
    columns: headers.map(label => ({label})), rows: values.map(row => ({cells: row.map(cell)})),
    summary, footerNote: note, emptyMessage: `Nenhum registro disponível para os filtros. ${note}`
  });
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const vehicles = filters => allVehicles.filter(v => !filters.vehicleId || v.id === filters.vehicleId);
  const entries = filters => getReportFinanceEntries(filters);
  const net = list => sumFinanceNetTotal(list);
  const money = list => formatCurrency(net(list));
  const category = e => isFuelEntry(e) || isFuelGroupEntry(e) ? 'Combustível' : String(e.categoria || e.serviceType || 'Despesas gerais / não classificadas');
  const badge = (label, value, help) => ({label, value: String(value), help});
  getReportTitleByType = type => titles[type] || (type === 'fuel_liters_per_km' ? 'Consumo médio (km/L)' : type === 'cost' ? 'Custo por km' : oldTitle(type));
  getReportFilters = () => ({...oldFilters(), type: document.getElementById('report-filter-type')?.value || 'overview', situation: document.getElementById('report-filter-situation')?.value || '', horizon: document.getElementById('report-filter-horizon')?.value || ''});
  getFilteredReportOrders = () => {
    const f = getReportFilters();
    return oldOrders().filter(o => f.type !== 'orders' || !f.situation || o.status === f.situation);
  };
  getReportDateContextLabel = type => {
    if (type === 'availability') return 'Retrato cadastral atual. O período não reconstrói disponibilidade histórica.';
    if (type === 'deadlines') return 'Datas de vencimento; revisões por km são exibidas somente sem janela de dias.';
    if (type === 'record_audit') return 'Data do envio. Somente registros da Central carregados nesta sessão; não é a auditoria completa do administrador.';
    if (['overview','maintenance_comparison','fines','driver_performance','vehicle_performance'].includes(type)) return 'Valores pela data principal do lançamento financeiro; OS pela abertura. Dados ausentes não são estimados.';
    if (type === 'irregularities') return 'Data de abastecimento. Alertas são indícios para revisão, não comprovação de erro ou fraude.';
    return oldContext(type);
  };

  buildReportData = filters => {
    const f = filters;
    if (['monthly_vehicle_cost','fuel_register','orders','finance_status','supplier_ranking'].includes(f.type)) {
      const fuelView = document.getElementById('report-filter-fuel-view')?.value || 'fuel_register';
      const result = oldBuild(f.type === 'fuel_register' ? {...f,type:fuelView} : f); result.title = f.type === 'fuel_register' && fuelView !== 'fuel_register' ? `${titles[f.type]} — ${getReportTitleByType(fuelView)}` : titles[f.type];
      if (f.type === 'orders') result.meta += ` • Situação: ${document.getElementById('report-filter-situation')?.selectedOptions?.[0]?.textContent || 'Todas'}`;
      if (f.type === 'fuel_register') result.meta += ' • Consumo médio (km/L) disponível na visão detalhada de consumo.';
      if (f.type === 'finance_status') result.meta += ' • Distribuído em OS não significa pago: quitação não é comprovada por esse status.';
      return result;
    }
    if (!titles[f.type]) return oldBuild(f);
    const list = entries(f), selectedVehicles = vehicles(f);
    if (f.type === 'overview') {
      const buckets = new Map();
      list.forEach(e => {const key = category(e); if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(e);});
      const ranking = selectedVehicles.map(v => ({v, total: net(list.filter(e => getEntryLinkedVehicleId(e) === v.id))})).sort((a,b) => b.total-a.total);
      return table(f, ['Categoria','Lançamentos','Custo líquido'], [...buckets].map(([k,l]) => [k,l.length,money(l)]),
        'Inclui lançamentos não agrupados, pendentes e distribuídos; receitas abatem despesas. Não representa pagamentos. Comparação mensal exige períodos equivalentes; não calculada nesta visão.',
        [badge('Custo líquido',money(list),'Pela data principal do lançamento.'),badge('Lançamentos',list.length,'Filhos de agrupamentos não são somados novamente.'),badge('Maior custo',ranking[0]?.v.placa || 'Sem dados',ranking[0] ? formatCurrency(ranking[0].total) : 'Sem valores'),badge('Categorias',buckets.size,'Classificação registrada, sem inferência por descrição.')]);
    }
    if (f.type === 'availability') {
      return table(f,['Frota','Placa','Situação operacional','Cadastro','Tempo parado'],selectedVehicles.map(v=>[v.numeroFrota,v.placa,v.situacaoOperacional || 'Não informado',v.ativo === false || v.active === false ? 'Inativo' : 'Sem inativação registrada','Não informado']),
        'Cadastro ativo não comprova disponibilidade. Percentual de disponibilidade e tempo parado dependem de apontamentos operacionais ainda não registrados.');
    }
    if (f.type === 'maintenance_comparison') {
      const orders = oldOrders();
      const groups = ['Preventiva','Corretiva','Não classificada'];
      const kind = o => ['preventiva','corretiva'].includes(norm(o.modalidadeManutencao)) ? norm(o.modalidadeManutencao) === 'preventiva' ? 'Preventiva' : 'Corretiva' : 'Não classificada';
      return table(f,['Modalidade','OS','Valor vinculado','Percentual de OS','Tempo médio parado'],groups.map(g=>{const os=orders.filter(o=>kind(o)===g),ids=new Set(os.map(o=>o.id));return [g,os.length,money(allFinanceEntries.filter(e=>ids.has(e.orderId)&&!e.groupedIntoId)),orders.length?`${(os.length/orders.length*100).toFixed(1)}%`:'Não informado','Não informado'];}),
        'Inclui OS filtradas pela abertura. Sem modalidade explícita, a OS fica Não classificada; não se deduz preventiva/corretiva pelo texto. Falhas recorrentes e paradas exigem registros próprios.');
    }
    if (f.type === 'vehicle_performance') {
      const stats=getVehicleCostStats(f), orders=oldOrders();
      return table(f,['Frota','Placa','Km calculados (combustível)','Custo combustível/km','Custo líquido geral','OS','Dias indisponíveis'],selectedVehicles.map(v=>{const s=stats.find(s=>s.vehicleId===v.id);return [v.numeroFrota,v.placa,s?.totalKm || 'Não informado',s?.totalKm>0?formatCurrency(s.costPerKm):'Não informado',money(list.filter(e=>getEntryLinkedVehicleId(e)===v.id)),orders.filter(o=>o.vehicleId===v.id).length,'Não informado'];}),
        'Km e custo/km seguem a base de combustíveis distribuídos em OS. Custos gerais usam lançamentos financeiros. Multas, ocorrências e tempo parado sem base estruturada não são inferidos.');
    }
    if (f.type === 'driver_performance') {
      return table(f,['Motorista','Lançamentos vinculados','Valor líquido','Litros registrados','Infrações e ocorrências'],allDrivers.map(d=>{const own=list.filter(e=>String(e.motoristaId || e.driverId || '')===String(d.id));return [d.nome,own.length,money(own),own.reduce((s,e)=>s+parseDecimalInputValue(e.litros),0).toLocaleString('pt-BR'),'Não informado'];}).filter(row=>!f.vehicleId || row[1]>0),
        'Somente vínculos explícitos do lançamento; não atribui ao motorista atual despesas antigas do veículo. Não é ranking de conduta. Eventos Rastraki não integrados nesta visão.');
    }
    if (f.type === 'fines') {
      const fines=list.filter(e=>/^(multa|multas|infracao|infracoes)$/.test(norm(e.categoria || e.serviceType)));
      return table(f,['Referência','Veículo','Valor','Vencimento','Motorista','Prazo de indicação','Situação'],fines.map(e=>[e.nf,getReportVehicleLabel(getEntryLinkedVehicleId(e)),formatCurrency(e.total),formatDate(e.dataVencimento),getDriverLabel(e.motoristaId || e.driverId),'Não informado',getFinanceEntryStatus(e)]),
        'Apenas despesas explicitamente classificadas como multa/infração. Ausência de linhas não comprova ausência de infrações; auto, prazo de indicação e reincidência exigem cadastro específico.');
    }
    if (f.type === 'deadlines') {
      const rows=[];
      const add=(type,who,date)=>{const days=date?daysUntil(date):null;if(f.horizon==='overdue'&&!(days!==null&&days<0))return;if(['7','30','60'].includes(f.horizon)&&!(days!==null&&days>=0&&days<=Number(f.horizon)))return;if((f.start||f.end)&&(!date||!isDateWithinRange(date,f.start,f.end)))return;rows.push([type,who,date?formatDate(date):'Não informado',days===null?'Documento/data ausente':days<0?'Vencido':`Vence em ${days} dia(s)`]);};
      const linkedDrivers=new Set(selectedVehicles.map(v=>String(v.motoristaId || v.driverId || '')));
      allDrivers.filter(d=>!f.vehicleId||linkedDrivers.has(String(d.id))).forEach(d=>add('CNH',d.nome,d.validade));
      selectedVehicles.forEach(v=>add('Seguro',v.placa,v.seguroVencimento));
      if(!f.horizon&&!f.start&&!f.end) getReportMaintenanceItems(f).forEach(({vehicle:v,maintenance:m})=>rows.push(['Revisão por km',v.placa,'Não se aplica',m.remainingKm===null?'KM ausente':m.remainingKm<=0?'Vencida':`Faltam ${m.remainingKm} km`]));
      return table(f,['Pendência','Responsável/veículo','Vencimento','Situação'],rows,
        'CNHs, seguros e revisões por km disponíveis. CRLV, contratos e prazos de multas ainda não possuem base estruturada nesta visão.');
    }
    if (f.type === 'record_audit') {
      const records=centralPendingRecords.filter(r=>{const d=r.data && typeof r.data==='object'?r.data:r;return (!f.vehicleId||String(d.vehicleId||r.vehicleId)===String(f.vehicleId))&&(!(f.start||f.end)||isDateWithinRange(d.data||r.createdAt,f.start,f.end));});
      return table(f,['Protocolo','Data','Motorista','Status','Comprovante','Tempo de processamento','Responsável pela ação'],records.map(r=>{const d=r.data && typeof r.data==='object'?r.data:r;return [d.protocolo||r.$id||r.id,d.data||r.createdAt,d.motorista||d.driverName,r.status||d.status,d.comprovanteUrl?'Vinculado':'Não informado','Não informado','Consultar auditoria administrativa'];}),
        'Recorte dos registros carregados da Central. Alterações, exclusões, falhas de sincronização e autoria completa permanecem na auditoria administrativa; lista vazia pode significar dados não carregados.');
    }
    if (f.type === 'irregularities') {
      const fuel=allFinanceEntries.filter(e=>isFuelEntry(e)).filter(e=>!f.vehicleId||getEntryLinkedVehicleId(e)===f.vehicleId);
      const sorted=[...fuel].sort((a,b)=>String(a.dataAbastecimento||getFinanceEntryDate(a)).localeCompare(String(b.dataAbastecimento||getFinanceEntryDate(b))));
      const previous=new Map(),seen=new Set(),rows=[];
      sorted.forEach(e=>{const id=getEntryLinkedVehicleId(e),date=e.dataAbastecimento||getFinanceEntryDate(e),km=Number(e.km),liters=parseDecimalInputValue(e.litros),flags=[];
        const key=JSON.stringify([id,date,e.km,liters,e.total]);if(seen.has(key))flags.push('Possível duplicidade (mesmos dados)');seen.add(key);
        if(e.km!==''&&e.km!=null&&Number.isFinite(km)){if(previous.has(id)&&km<previous.get(id))flags.push('Hodômetro menor que anterior');previous.set(id,km);}
        if(!e.comprovanteUrl&&!e.receiptUrl&&!e.comprovante)flags.push('Comprovante não identificado nos campos padrão');
        if(flags.length&&(!(f.start||f.end)||isDateWithinRange(date,f.start,f.end)))rows.push([formatDate(date),getReportVehicleLabel(id),e.nf||e.id,flags.join('; ')]);
      });
      return table(f,['Data','Veículo','Referência','Indícios para revisão'],rows,
        'Indícios, não conclusões. Anexos podem existir em agrupamentos. Capacidade de tanque e limites de preço/consumo precisam ser configurados antes de gerar esses alertas.');
    }
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const select=document.getElementById('report-filter-type');if(!select)return;
    select.innerHTML=Object.entries(titles).map(([value,title])=>`<option value="${value}">${title}</option>`).join('');
    const refresh=()=>{document.getElementById('report-situation-wrap').hidden=select.value!=='orders';document.getElementById('report-horizon-wrap').hidden=select.value!=='deadlines';document.getElementById('report-fuel-view-wrap').hidden=select.value!=='fuel_register';};
    select.addEventListener('change',refresh);refresh();renderReports();
  });
  clearReportFilters = () => {
    for(const [id,value] of Object.entries({'report-filter-type':'overview','report-filter-vehicle':'','report-filter-start':'','report-filter-end':'','report-filter-situation':'','report-filter-horizon':'','report-filter-fuel-view':'fuel_register'})) setFilterValue(id,value);
    for(const id of ['report-situation-wrap','report-horizon-wrap','report-fuel-view-wrap']) {const node=document.getElementById(id);if(node)node.hidden=true;}
    syncReportDateBounds();renderReports();
  };
})();

