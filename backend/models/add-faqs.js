// Script para adicionar novas FAQs ao banco de producao (sem apagar dados existentes)
// Uso: MONGO_URI="mongodb+srv://..." node models/add-faqs.js
const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const ChatbotFaq = require("./07_chatbot_faqs");

const novasFaqs = [
  // Horarios
  {
    pergunta: "Qual o horario de funcionamento?",
    resposta: "Atendemos de segunda a sexta das 08h às 20h e sábados das 10h às 16h.",
    categoria: "horarios",
    palavras_chave: ["horario","funcionamento","aberto","fecha","abre","funciona","atende","sabado","domingo"],
    ordem: 1,
  },

  // Agendamento
  {
    pergunta: "Como agendar uma consulta?",
    resposta: "Acesse a página 'Agendar Consulta', escolha o serviço, a data e o horário disponível, preencha seus dados e confirme. É rápido e fácil!",
    categoria: "agendamento",
    palavras_chave: ["agendar","marcar","consulta","agendamento","como","reservar"],
    ordem: 2,
  },
  {
    pergunta: "Posso cancelar ou reagendar?",
    resposta: "Sim! Você pode cancelar ou reagendar com até 48 horas de antecedência, no máximo 2 vezes. Entre em contato pelo WhatsApp (34) 3479-8570.",
    categoria: "agendamento",
    palavras_chave: ["cancelar","reagendar","alterar","remarcar","cancelamento","desistir","mudar"],
    ordem: 3,
  },
  {
    pergunta: "Preciso pagar para agendar?",
    resposta: "O agendamento online é gratuito. O pagamento é realizado na clínica no dia da consulta.",
    categoria: "agendamento",
    palavras_chave: ["pagar","pagamento","gratuito","gratis","valor","preco","custo","taxa"],
    ordem: 4,
  },

  // Servicos
  {
    pergunta: "Quais servicos a clinica oferece?",
    resposta: "Oferecemos: Consulta Inicial, Terapia de Rejuvenescimento, Ozônioterapia, Nutrição Funcional e Oxigenoterapia Hiperbárica. Acesse a página de Serviços para saber mais!",
    categoria: "servicos",
    palavras_chave: ["servico","tratamento","oferece","disponivel","procedimento","terapia"],
    ordem: 5,
  },
  {
    pergunta: "O que e oxigenoterapia hiperbar ica?",
    resposta: "A Oxigenoterapia Hiperbárica consiste em respirar oxigênio puro em uma câmara pressurizada. Acelera a cicatrização, melhora a recuperação pós-cirúrgica e potencializa a regeneração celular.",
    categoria: "servicos",
    palavras_chave: ["oxigenoterapia","hiperbar","camara","oxigenio","hiperbarica","pressurizada","cicatrizacao"],
    ordem: 6,
  },
  {
    pergunta: "O que e ozonioterapia?",
    resposta: "A Ozônioterapia utiliza ozônio medicinal para tratamento de diversas condições. Tem ação anti-inflamatória, antimicrobiana e estimula o sistema imunológico.",
    categoria: "servicos",
    palavras_chave: ["ozonio","ozonioterapia","ozono"],
    ordem: 7,
  },
  {
    pergunta: "O que e terapia de rejuvenescimento?",
    resposta: "A Terapia de Rejuvenescimento são protocolos personalizados que combinam técnicas de medicina regenerativa para revitalização e melhora da qualidade de vida.",
    categoria: "servicos",
    palavras_chave: ["rejuvenescimento","rejuvenescer","estetica","antienvelhecimento","anti"],
    ordem: 8,
  },
  {
    pergunta: "O que e nutricao funcional?",
    resposta: "A Nutrição Funcional é uma abordagem que considera o organismo como um todo, buscando o equilíbrio nutricional personalizado para cada paciente.",
    categoria: "servicos",
    palavras_chave: ["nutricao","nutricional","nutricionista","dieta","alimentacao","alimento"],
    ordem: 9,
  },

  // Localizacao e Contato
  {
    pergunta: "Onde fica a clinica?",
    resposta: "Estamos na R. Dona Rafa Cecílio, 367 - Vila Maria Helena, Uberaba - MG (CEP 38020-080).",
    categoria: "localizacao",
    palavras_chave: ["endereco","onde","fica","localizacao","mapa","uberaba","rua","local","bairro"],
    ordem: 10,
  },
  {
    pergunta: "Qual o telefone da clinica?",
    resposta: "Nosso WhatsApp e telefone é (34) 3479-8570. Pode nos chamar pelo WhatsApp para agendar ou tirar dúvidas!",
    categoria: "localizacao",
    palavras_chave: ["telefone","whatsapp","contato","numero","ligar","falar","zap","wpp"],
    ordem: 11,
  },
  {
    pergunta: "Como chegar na clinica?",
    resposta: "Estamos em Uberaba-MG. Acesse o Google Maps pelo ícone de localização no rodapé do site para ver o trajeto completo.",
    categoria: "localizacao",
    palavras_chave: ["chegar","como","ir","maps","google","caminho","trajeto","rota"],
    ordem: 12,
  },

  // Doutora / Equipe
  {
    pergunta: "Quem e a Dra Flavia Franco?",
    resposta: "A Dra. Flávia Franco é especialista em medicina regenerativa e alta performance. Com mais de 10 anos de experiência, já atendeu mais de 5.000 pacientes.",
    categoria: "outros",
    palavras_chave: ["flavia","franco","doutora","medica","especialista","quem","dr"],
    ordem: 13,
  },
  {
    pergunta: "A clinica e especializada em que?",
    resposta: "Somos especializados em medicina regenerativa, alta performance e recuperação acelerada. Trabalhamos com protocolos personalizados para cada paciente.",
    categoria: "outros",
    palavras_chave: ["especializada","especialidade","foco","area","medicina","regenerativa","performance"],
    ordem: 14,
  },

  // Plano de saude
  {
    pergunta: "Aceita plano de saude?",
    resposta: "Para informações sobre convênios e planos aceitos, entre em contato diretamente pelo WhatsApp (34) 3479-8570.",
    categoria: "outros",
    palavras_chave: ["plano","convenio","saude","unimed","sulamerica","bradesco","seguro"],
    ordem: 15,
  },
];

async function addFaqs() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI nao definida. Exporte a variavel antes de rodar.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ MongoDB conectado");

  let adicionadas = 0;
  for (const faq of novasFaqs) {
    const existe = await ChatbotFaq.findOne({ pergunta: faq.pergunta });
    if (!existe) {
      await ChatbotFaq.create(faq);
      adicionadas++;
      console.log(`  ✅ Adicionada: ${faq.pergunta}`);
    } else {
      console.log(`  ⏭  Já existe: ${faq.pergunta}`);
    }
  }

  console.log(`\n✅ Concluído: ${adicionadas} FAQs adicionadas.`);
  await mongoose.disconnect();
}

addFaqs().catch((err) => { console.error("Erro:", err); process.exit(1); });
