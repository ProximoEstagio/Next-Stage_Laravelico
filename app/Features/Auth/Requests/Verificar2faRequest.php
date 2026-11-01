<?php

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Verificar2faRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'desafio' => ['required', 'string', 'size:64'],
            'codigo'  => ['required', 'digits:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'desafio.required' => 'Desafio de verificação ausente',
            'desafio.size'     => 'Desafio de verificação inválido',
            'codigo.required'  => 'Informe o código recebido por e-mail',
            'codigo.digits'    => 'O código deve ter 6 dígitos',
        ];
    }
}
