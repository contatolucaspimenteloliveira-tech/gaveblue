const pages = {
      inicio: () => `
        <section class="mt-10 sm:mt-16 px-1 sm:px-0">
          <div class="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
            <span class="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-200 text-sm font-semibold mb-5">O que você encontra na GaveBlue</span>
            <h1 id="hero-title" class="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              <span class="block bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Ferramentas úteis para</span>
              <span class="block bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">rotinas mais rápidas e organizadas</span>
            </h1>
            <p id="hero-subtitle" class="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mt-4 sm:mt-5 px-2 sm:px-0">
              Desenvolvida para reunir ferramentas úteis em um só lugar, a GaveBlue facilita rotinas operacionais, consultas rápidas, organização de tarefas e testes práticos no dia a dia.
            </p>
            <div class="flex justify-center mt-6 sm:mt-8">
              <a href="https://gaveblue.com.br/recibos/" target="_self" rel="noopener noreferrer" class="inline-flex px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-sm sm:text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl pulse-glow items-center gap-2 w-fit text-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Testar Grátis - Gerador de Recibos
              </a>
            </div>
            <div class="flex justify-center items-center gap-2 mt-4">
              <div class="flex gap-1">
                <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <span class="text-sm text-slate-300 font-medium">4.99/5</span>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            <a href="https://gaveblue.com.br/recibos/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-blue-400/40 transition-all relative overflow-hidden">
              <span class="module-badge module-badge--free">Grátis</span>
              <div class="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">WeRecibos</h3>
              <p class="text-slate-300 leading-relaxed">Crie recibos online com rapidez e mais apresentação, ideal para quem precisa emitir documentos de forma prática e profissional.</p>
            </a>
            <a href="https://gaveblue.com.br/wetasks/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-amber-400/40 transition-all relative overflow-hidden">
              <span class="module-badge module-badge--free">Grátis</span>
              <div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">WeTasks</h3>
              <p class="text-slate-300 leading-relaxed">Organize tarefas, acompanhe demandas e mantenha a rotina mais clara com um módulo pensado para produtividade diária.</p>
            </a>
            <a href="/wefrotas/conheca/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-indigo-400/40 transition-all relative overflow-hidden">
              <span class="module-badge module-badge--premium"><span aria-hidden="true">★</span> Premium</span>
              <div class="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h11v9H3z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">WeFrotas</h3>
              <p class="text-slate-300 leading-relaxed">Gerencie veículos, motoristas, ordens de serviço, financeiro e relatórios em uma central pensada para operações de frota.</p>
            </a>
            <a href="https://gaveblue.com.br/weconsultas/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-purple-400/40 transition-all relative overflow-hidden">
              <div class="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">WeConsultas</h3>
              <p class="text-slate-300 leading-relaxed">Consulte CEP, CNPJ e outras informações com mais agilidade para acelerar atendimentos, cadastros e verificações rápidas.</p>
            </a>
            <a href="https://gaveblue.com.br/wedevs/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-cyan-400/40 transition-all relative overflow-hidden">
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">WeDevs</h3>
              <p class="text-slate-300 leading-relaxed">Teste HTML com rapidez em um ambiente simples para validar ideias, trechos de código e ajustes visuais sem complicação.</p>
            </a>
            <a href="https://gaveblue.com.br/wetime/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-green-400/40 transition-all relative overflow-hidden">
              <div class="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">WeTime</h3>
              <p class="text-slate-300 leading-relaxed">Acompanhe o horário em tempo real com uma ferramenta leve, útil para rotinas operacionais, conferências e uso rápido no navegador.</p>
            </a>
            <a href="https://gaveblue.com.br/OPF/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-700/50 bg-white/[0.04] p-5 sm:p-7 hover:bg-white/[0.06] hover:border-rose-400/40 transition-all relative overflow-hidden">
              <span class="absolute top-5 right-5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-lg">Novo</span>
              <div class="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">OPF</h3>
              <p class="text-slate-300 leading-relaxed">Emita ordens de pagamento financeiro com uma interface centralizada para lançamentos, cadastros e conferência operacional.</p>
            </a>
            <a href="/phone-flip-simulator/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-slate-950/90 p-5 sm:p-7 hover:border-emerald-400/50 transition-all relative overflow-hidden">
              <span class="absolute top-5 right-5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">Jogo</span>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2.5" stroke-width="2"></rect><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 5h4m-4 10 4-4m-4 0h4v4m-3 4h2" /></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">Phone Flip Simulator</h3>
              <p class="text-slate-300 leading-relaxed">Comece com R$ 5.000 virtuais, compre celulares usados e negocie cada revenda. Avalie riscos, construa sua reputação e faça seu patrimônio crescer.</p>
              <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">Jogar grátis
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-6-6 6 6-6 6" /></svg>
              </span>
            </a>
            <a href="/transportadora-simulator/" class="group rounded-[1.5rem] sm:rounded-[1.75rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-slate-950/90 p-5 sm:p-7 hover:border-cyan-400/50 transition-all relative overflow-hidden">
              <span class="absolute top-5 right-5 px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold shadow-lg">Jogo</span>
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h11v12H3V5zm11 5h4l3 4v3h-7"/><circle cx="7" cy="18" r="2" stroke-width="2"/><circle cx="18" cy="18" r="2" stroke-width="2"/></svg>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-3">Transportadora Simulator</h3>
              <p class="text-slate-300 leading-relaxed">Comece com uma Fiorino e R$ 2.000 virtuais. Faça entregas em um mapa 3D, compre veículos, contrate motoristas e transforme sua transportadora em um império logístico.</p>
              <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Jogar grátis
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-6-6 6 6-6 6" /></svg>
              </span>
            </a>
          </div>
        </section>
        <section class="custom-solutions-section mt-12 sm:mt-16 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-slate-900/90 p-5 sm:p-8 lg:p-10 shadow-2xl shadow-fuchsia-950/20">
          <div class="custom-solutions-grid grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-center">
            <div class="custom-solutions-copy">
              <span class="inline-flex items-center px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/20 text-fuchsia-200 text-sm font-semibold mb-4">Apps e soluções sob medida</span>
              <h2 class="custom-solutions-title text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Desenvolvemos soluções digitais que <span>transformam ideias em resultados reais</span></h2>
              <p class="text-slate-300 leading-relaxed max-w-3xl">Além das ferramentas do ecossistema GaveBlue, criamos aplicativos e interfaces personalizadas para marcas, campanhas e operações de todos os tamanhos.</p>
              <div class="mt-6 flex flex-wrap gap-3">
                <a href="https://wa.me/5527988790381" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-950/30 transition hover:from-fuchsia-600 hover:to-purple-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" /></svg>
                  Quero um app assim
                </a>
                <a href="/catalogo/" target="_self" rel="noopener noreferrer" class="custom-solutions-secondary inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
                  Ver projetos
                </a>
              </div>
            </div>
            <a href="/catalogo/" target="_self" rel="noopener noreferrer" class="custom-solutions-visual block rounded-[1.5rem] border border-fuchsia-400/20 bg-white/[0.04] p-3 shadow-xl shadow-fuchsia-950/20 transition hover:border-fuchsia-300/40 hover:bg-white/[0.06]">
              <div class="overflow-hidden rounded-[1.1rem] border border-white/10 bg-slate-950/70">
                <img src="https://i.imgur.com/y5VFWvr.png" alt="Material promocional de aplicativo desenvolvido para o Grupo Cover" class="w-full h-auto object-cover" loading="lazy">
              </div>
            </a>
          </div>
        </section>
        <section class="mt-12 sm:mt-16 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-700/50 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-950/90 p-5 sm:p-8 lg:p-10 shadow-2xl shadow-cyan-950/20">
          <div class="max-w-3xl mx-auto text-center mb-10">
            <span class="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-200 text-sm font-semibold mb-4">Nossos parceiros</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Empresas e marcas que caminham com a GaveBlue</h2>
            <p class="text-slate-300 leading-relaxed">Construímos conexões com parceiros que fortalecem nossa entrega, ampliam nosso alcance e ajudam a criar soluções mais completas para quem usa o ecossistema GaveBlue.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <a href="https://instagram.com/covreagricola" target="_blank" rel="noopener noreferrer" class="partner-card group rounded-[1.5rem] border border-slate-700/50 p-5 sm:p-6 hover:border-cyan-400/40 transition-all">
              <div class="partner-logo-wrap rounded-[1.2rem] border border-white/10 p-4">
                <img src="https://i.imgur.com/ruFvnwS.png" alt="Covre Agrícola" class="w-full h-28 sm:h-32 object-contain" loading="lazy">
              </div>
              <div class="mt-5">
                <h3 class="text-xl font-bold text-white">Covre Agrícola</h3>
                <p class="mt-2 text-slate-300 leading-relaxed">Parceiro com presença no setor agro, fortalecendo conexões da GaveBlue com operações reais, comunicação digital e projetos que aproximam tecnologia e mercado.</p>
                <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Visitar parceiro
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h4m0 0v4m0-4L10 14" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h6M5 5v14h14v-6" /></svg>
                </span>
              </div>
            </a>
            <a href="https://instagram.com/covreecia" target="_blank" rel="noopener noreferrer" class="partner-card group rounded-[1.5rem] border border-slate-700/50 p-5 sm:p-6 hover:border-cyan-400/40 transition-all">
              <div class="partner-logo-wrap rounded-[1.2rem] border border-white/10 p-4">
                <img src="https://i.imgur.com/YuuzkEM.png" alt="Covre e Cia" class="w-full h-28 sm:h-32 object-contain" loading="lazy">
              </div>
              <div class="mt-5">
                <h3 class="text-xl font-bold text-white">Covre e Cia</h3>
                <p class="mt-2 text-slate-300 leading-relaxed">Uma parceria voltada a relacionamento, visibilidade e presença digital, ampliando a rede de atuação da GaveBlue com marcas que compartilham da mesma visão de crescimento.</p>
                <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Visitar parceiro
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h4m0 0v4m0-4L10 14" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h6M5 5v14h14v-6" /></svg>
                </span>
              </div>
            </a>
            <a href="https://wa.me/5527988790381" target="_blank" rel="noopener noreferrer" class="group rounded-[1.5rem] border border-dashed border-emerald-400/35 bg-emerald-500/[0.06] p-5 sm:p-6 hover:bg-emerald-500/[0.10] hover:border-emerald-300/50 transition-all">
              <div class="rounded-[1.2rem] border border-dashed border-emerald-300/30 bg-slate-950/60 p-4 flex items-center justify-center">
                <div class="flex h-28 sm:h-32 w-full items-center justify-center rounded-[1rem] bg-emerald-500/10 text-center">
                  <span class="text-xl sm:text-2xl font-extrabold tracking-wide text-emerald-200">Sua marca aqui</span>
                </div>
              </div>
              <div class="mt-5">
                <h3 class="text-xl font-bold text-white">Seja parceiro da GaveBlue</h3>
                <p class="mt-2 text-slate-300 leading-relaxed">Coloque sua marca em destaque dentro do ecossistema GaveBlue e fortaleça sua presença com uma vitrine pensada para gerar conexão, confiança e novas oportunidades.</p>
                <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">Quero aparecer aqui
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h4m0 0v4m0-4L10 14" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h6M5 5v14h14v-6" /></svg>
                </span>
              </div>
            </a>
          </div>
          <div class="mt-8 flex justify-center">
            <a href="https://wa.me/5527988790381" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" /></svg>
              Quero ser parceiro da GaveBlue
            </a>
          </div>
        </section>
      `
    };

    function loadPage(pageName) {
      const mainContent = document.getElementById('main-content');
      const pageContent = pages[pageName] ? pages[pageName]() : pages.inicio();
      mainContent.querySelector('.max-w-7xl').innerHTML = pageContent;
      updateClock();
    }

    function goToSection(section) {
      loadPage(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadPage('inicio');

    const mouseGlow = document.getElementById('mouseGlow');
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;

    if (!isMobile) {
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseGlow.classList.add('active');
        if (Math.random() > 0.7) createSparkle(mouseX, mouseY);
      });

      document.addEventListener('mouseleave', () => {
        mouseGlow.classList.remove('active');
      });

      function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
        sparkle.style.top = (y + (Math.random() - 0.5) * 40) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
      }

      function updateGlow() {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        mouseGlow.style.left = (glowX - 225) + 'px';
        mouseGlow.style.top = (glowY - 225) + 'px';
        requestAnimationFrame(updateGlow);
      }

      updateGlow();
    }
    function updateClock() {
      const clockDisplay = document.getElementById('wetime-display');
      if (!clockDisplay) return;
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    const defaultConfig = {
      company_name: 'GaveBlue',
      hero_title: 'Ferramentas úteis para rotinas mais rápidas e organizadas',
      hero_subtitle: 'A GaveBlue reúne utilidades online para gerar recibos, organizar tarefas, consultar informações e testar soluções em um só lugar, com mais praticidade no dia a dia.',
      primary_color: '#3b82f6',
      secondary_color: '#8b5cf6'
    };

    let config = { ...defaultConfig };

    async function onConfigChange(newConfig) {
      config = { ...config, ...newConfig };

      const heroTitle = document.getElementById('hero-title');
      if (heroTitle) {
        const titleText = config.hero_title || defaultConfig.hero_title;
        const parts = titleText.split(' ');
        const midPoint = Math.ceil(parts.length / 2);
        const firstLine = parts.slice(0, midPoint).join(' ');
        const secondLine = parts.slice(midPoint).join(' ');
        heroTitle.innerHTML = `
          <span class="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">${firstLine}</span>
          <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> ${secondLine}</span>
        `;
      }

      const heroSubtitle = document.getElementById('hero-subtitle');
      if (heroSubtitle) {
        heroSubtitle.textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
      }
    }

    function mapToCapabilities(currentConfig) {
      return {
        recolorables: [
          {
            get: () => currentConfig.primary_color || defaultConfig.primary_color,
            set: (value) => {
              currentConfig.primary_color = value;
              window.elementSdk.setConfig({ primary_color: value });
            }
          },
          {
            get: () => currentConfig.secondary_color || defaultConfig.secondary_color,
            set: (value) => {
              currentConfig.secondary_color = value;
              window.elementSdk.setConfig({ secondary_color: value });
            }
          }
        ],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      };
    }

    function mapToEditPanelValues(currentConfig) {
      return new Map([
        ['company_name', currentConfig.company_name || defaultConfig.company_name],
        ['hero_title', currentConfig.hero_title || defaultConfig.hero_title],
        ['hero_subtitle', currentConfig.hero_subtitle || defaultConfig.hero_subtitle]
      ]);
    }

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities,
        mapToEditPanelValues
      });
    }
