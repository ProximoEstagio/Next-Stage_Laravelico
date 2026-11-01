<?php

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Reenviar2faRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'desafio' => ['required', 'string', 'size:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'desafio.required' => 'Desafio de verificação ausente',
            'desafio.size'     => 'Desafio de verificação inválido',
        ];
    }
}
