'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import { Badge, BadgeGroup } from '@/components/ui/Badge';
import { Modal, ModalFooter, ConfirmModal } from '@/components/ui/Modal';
import {
  NoDataEmptyState,
  NoResultsEmptyState,
  ErrorEmptyState,
  CreateFirstEmptyState,
} from '@/components/ui/EmptyState';

export default function UIShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            🎨 UI Components Showcase
          </h1>
          <p className="text-text-secondary">
            Fase 2 - Redesign Visual com nova paleta
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Badge variant="success" dot>
              Verde: #0D2818
            </Badge>
            <Badge variant="primary" dot>
              Amarelo: #F5B731
            </Badge>
            <Badge variant="neutral" dot>
              Branco: #FFFFFF
            </Badge>
          </div>
        </div>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Buttons</h2>
          <Card>
            <CardBody>
              <div className="space-y-6">
                {/* Variants */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Variantes
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Tamanhos
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* States */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Estados
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button
                      leftIcon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      }
                    >
                      Com Ícone
                    </Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader title="Default Card" subtitle="Com transparência" />
              <CardBody>Conteúdo do card com background padrão.</CardBody>
            </Card>

            <Card variant="elevated" hover>
              <CardHeader title="Elevated Card" subtitle="Com hover" />
              <CardBody>Card com sombra e efeito de hover.</CardBody>
            </Card>

            <Card variant="outline">
              <CardHeader
                title="Outline Card"
                action={
                  <Button size="sm" variant="ghost">
                    ⚙️
                  </Button>
                }
              />
              <CardBody>Card com borda e header com ação.</CardBody>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Cancelar
                </Button>
                <Button size="sm">Salvar</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Inputs</h2>
          <Card>
            <CardBody>
              <div className="space-y-6 max-w-2xl">
                <Input
                  label="Nome"
                  placeholder="Digite seu nome"
                  hint="Mínimo 3 caracteres"
                  fullWidth
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    setInputError(
                      e.target.value.includes('@') ? '' : 'Email deve conter @'
                    );
                  }}
                  error={inputError}
                  leftIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  fullWidth
                />

                <TextArea
                  label="Mensagem"
                  placeholder="Digite sua mensagem..."
                  hint="Máximo 500 caracteres"
                  rows={4}
                  fullWidth
                />
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Badges</h2>
          <Card>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Variantes
                  </h3>
                  <BadgeGroup>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                  </BadgeGroup>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Tamanhos
                  </h3>
                  <BadgeGroup>
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </BadgeGroup>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Com Dot
                  </h3>
                  <BadgeGroup>
                    <Badge variant="success" dot>
                      Online
                    </Badge>
                    <Badge variant="warning" dot>
                      Away
                    </Badge>
                    <Badge variant="error" dot>
                      Offline
                    </Badge>
                  </BadgeGroup>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Modals */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Modals</h2>
          <Card>
            <CardBody>
              <div className="flex gap-3">
                <Button onClick={() => setIsModalOpen(true)}>
                  Abrir Modal
                </Button>
                <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                  Abrir Confirm Modal
                </Button>
              </div>
            </CardBody>
          </Card>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Exemplo de Modal"
            description="Este é um modal completo com header, body e footer."
            size="md"
          >
            <p className="text-text-secondary mb-4">
              O modal possui overlay com blur, animações de entrada/saída, e
              fecha com ESC ou clicando fora.
            </p>

            <Input
              label="Campo de teste"
              placeholder="Digite algo..."
              fullWidth
            />

            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Confirmar</Button>
            </ModalFooter>
          </Modal>

          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              alert('Confirmado!');
              setIsConfirmOpen(false);
            }}
            title="Confirmar ação"
            description="Esta ação não pode ser desfeita. Deseja continuar?"
            confirmText="Sim, continuar"
            cancelText="Não, cancelar"
            variant="danger"
          />
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Empty States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <NoDataEmptyState onRefresh={() => alert('Refresh!')} />
            </Card>

            <Card>
              <NoResultsEmptyState
                searchTerm="teste"
                onClearFilters={() => alert('Limpar filtros')}
              />
            </Card>

            <Card>
              <ErrorEmptyState onRetry={() => alert('Retry!')} />
            </Card>

            <Card>
              <CreateFirstEmptyState
                resourceName="meta"
                onCreate={() => alert('Criar meta')}
              />
            </Card>
          </div>
        </section>

        {/* Color Palette Reference */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Paleta de Cores
          </h2>
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div
                    className="h-20 rounded-lg mb-2"
                    style={{ background: '#0D2818' }}
                  />
                  <p className="text-xs text-text-secondary">BG Primary</p>
                  <p className="text-xs font-mono text-text-muted">#0D2818</p>
                </div>

                <div>
                  <div
                    className="h-20 rounded-lg mb-2"
                    style={{ background: '#1A4731' }}
                  />
                  <p className="text-xs text-text-secondary">BG Secondary</p>
                  <p className="text-xs font-mono text-text-muted">#1A4731</p>
                </div>

                <div>
                  <div
                    className="h-20 rounded-lg mb-2"
                    style={{ background: '#F5B731' }}
                  />
                  <p className="text-xs text-text-secondary">Primary</p>
                  <p className="text-xs font-mono text-text-muted">#F5B731</p>
                </div>

                <div>
                  <div
                    className="h-20 rounded-lg mb-2"
                    style={{ background: '#22C55E' }}
                  />
                  <p className="text-xs text-text-secondary">Success</p>
                  <p className="text-xs font-mono text-text-muted">#22C55E</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
