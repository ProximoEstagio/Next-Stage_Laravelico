<?php

namespace App\Features\FAQ\Services;

use App\Models\Faq;

class FaqService
{
    public function listar(): array
    {
        return Faq::where('ativo', true)->orderBy('ordem')->get()->toArray();
    }

    public function listarTodos(): array
    {
        return Faq::orderBy('ordem')->get()->toArray();
    }

    public function criar(string $pergunta, string $resposta): array
    {
        $maxOrdem = Faq::max('ordem') ?? 0;
        $faq = Faq::create([
            'pergunta' => $pergunta,
            'resposta' => $resposta,
            'ordem'    => $maxOrdem + 1,
            'ativo'    => true,
        ]);
        return ['ok' => true, 'idfaq' => $faq->idfaq];
    }

    public function atualizar(int $id, string $pergunta, string $resposta): array
    {
        Faq::where('idfaq', $id)->update(['pergunta' => $pergunta, 'resposta' => $resposta]);
        return ['ok' => true];
    }

    public function toggleAtivo(int $id): array
    {
        $faq = Faq::find($id);
        if (!$faq) return ['ok' => false, 'erro' => 'FAQ não encontrado'];
        $faq->update(['ativo' => !$faq->ativo]);
        return ['ok' => true];
    }

    public function excluir(int $id): array
    {
        Faq::where('idfaq', $id)->delete();
        return ['ok' => true];
    }
}