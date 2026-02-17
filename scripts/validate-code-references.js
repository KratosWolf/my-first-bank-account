/**
 * VALIDATION SCRIPT - Code References Check
 *
 * Este script verifica que todas as referências no código foram atualizadas:
 * 1. Busca por "annual_rate" no código (não deve encontrar)
 * 2. Confirma que "monthly_rate" está presente nos arquivos corretos
 * 3. Valida que a UI exibe "Taxa Mensal (%)" corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDAÇÃO: Referências no Código\n');
console.log('='.repeat(60));

let allChecksPassed = true;

// ============================================================
// CHECK 1: Verificar arquivos críticos por "annual_rate"
// ============================================================
console.log(
  '\n📋 CHECK 1: Procurando referências a "annual_rate" em arquivos críticos...\n'
);

const criticalFiles = [
  'src/lib/supabase.ts',
  'src/lib/services/interestService.ts',
  'src/lib/services/transactions.ts',
  'components/InterestConfigManager.tsx',
];

let foundAnnualRate = false;

criticalFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const matches = content.match(/annual_rate/gi);

  if (matches && matches.length > 0) {
    console.log(
      `   ❌ ${filePath}: encontradas ${matches.length} referência(s) a "annual_rate"`
    );
    foundAnnualRate = true;
    allChecksPassed = false;
  } else {
    console.log(`   ✅ ${filePath}: nenhuma referência a "annual_rate"`);
  }
});

if (!foundAnnualRate) {
  console.log(
    '\n✅ Nenhuma referência a "annual_rate" encontrada nos arquivos críticos'
  );
} else {
  console.log(
    '\n❌ Referências a "annual_rate" AINDA EXISTEM - corrija antes de continuar'
  );
}

// ============================================================
// CHECK 2: Confirmar "monthly_rate" nos arquivos corretos
// ============================================================
console.log('\n📋 CHECK 2: Confirmando presença de "monthly_rate"...\n');

const expectedMonthlyRateFiles = [
  'src/lib/supabase.ts',
  'src/lib/services/interestService.ts',
  'src/lib/services/transactions.ts',
  'components/InterestConfigManager.tsx',
];

let allFilesHaveMonthlyRate = true;

expectedMonthlyRateFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const matches = content.match(/monthly_rate/gi);

  if (matches && matches.length > 0) {
    console.log(
      `   ✅ ${filePath}: ${matches.length} referência(s) a "monthly_rate"`
    );
  } else {
    console.log(
      `   ❌ ${filePath}: NENHUMA referência a "monthly_rate" (esperado pelo menos 1)`
    );
    allFilesHaveMonthlyRate = false;
    allChecksPassed = false;
  }
});

if (allFilesHaveMonthlyRate) {
  console.log(
    '\n✅ Todos os arquivos críticos têm referências a "monthly_rate"'
  );
} else {
  console.log('\n❌ Alguns arquivos NÃO têm "monthly_rate" - verifique acima');
}

// ============================================================
// CHECK 3: Verificar labels na UI (InterestConfigManager.tsx)
// ============================================================
console.log('\n📋 CHECK 3: Verificando labels na UI...\n');

const uiFilePath = path.join(
  process.cwd(),
  'components/InterestConfigManager.tsx'
);

if (fs.existsSync(uiFilePath)) {
  const content = fs.readFileSync(uiFilePath, 'utf8');

  // Verificar se tem "Taxa Mensal" (português correto)
  const hasTaxaMensal = /Taxa Mensal/i.test(content);
  const hasAoMes = /ao mês/i.test(content);
  const hasAoAno = /ao ano/i.test(content);

  if (hasTaxaMensal) {
    console.log('   ✅ Label "Taxa Mensal" encontrado na UI');
  } else {
    console.log('   ❌ Label "Taxa Mensal" NÃO encontrado na UI');
    allChecksPassed = false;
  }

  if (hasAoMes) {
    console.log('   ✅ Texto "ao mês" encontrado na UI');
  } else {
    console.log('   ⚠️  Texto "ao mês" NÃO encontrado na UI');
  }

  if (hasAoAno) {
    console.log(
      '   ⚠️  Texto "ao ano" AINDA EXISTE na UI (pode estar em preview, verifique contexto)'
    );
    // Nota: "ao ano" pode aparecer no preview de rendimento anual, então não é necessariamente erro
  } else {
    console.log(
      '   ℹ️  Nenhuma menção a "ao ano" na UI (correto se remover todas)'
    );
  }
} else {
  console.log('   ❌ Arquivo InterestConfigManager.tsx não encontrado');
  allChecksPassed = false;
}

// ============================================================
// CHECK 4: Verificar comentários e documentação
// ============================================================
console.log('\n📋 CHECK 4: Verificando comentários e documentação...\n');

const supabaseTypesPath = path.join(process.cwd(), 'src/lib/supabase.ts');

if (fs.existsSync(supabaseTypesPath)) {
  const content = fs.readFileSync(supabaseTypesPath, 'utf8');

  // Procurar comentário explicando monthly_rate
  const hasMonthlyRateComment = /monthly_rate.*Taxa mensal/i.test(content);

  if (hasMonthlyRateComment) {
    console.log(
      '   ✅ Comentário explicativo para "monthly_rate" encontrado em supabase.ts'
    );
  } else {
    console.log(
      '   ⚠️  Comentário explicativo para "monthly_rate" não encontrado (recomendado adicionar)'
    );
  }
} else {
  console.log('   ❌ Arquivo supabase.ts não encontrado');
  allChecksPassed = false;
}

// ============================================================
// RESULTADO FINAL
// ============================================================
console.log('\n' + '='.repeat(60));

if (allChecksPassed) {
  console.log('\n✅ TODOS OS CHECKS PASSARAM!');
  console.log('\nCódigo atualizado corretamente:');
  console.log('   ✅ Sem referências a annual_rate');
  console.log('   ✅ monthly_rate presente em todos os arquivos');
  console.log('   ✅ Labels da UI atualizados');
  console.log(
    '\n👉 Próximo passo: Rodar validação do banco (validate-task-1.2.js)\n'
  );
  process.exit(0);
} else {
  console.log('\n❌ ALGUNS CHECKS FALHARAM');
  console.log('\n👉 Corrija os problemas listados acima antes de continuar\n');
  process.exit(1);
}
