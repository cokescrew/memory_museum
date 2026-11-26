document.addEventListener('DOMContentLoaded', () => {

    const dialog = document.getElementById('post-action-dialog');
    const form = document.getElementById('action-dialog-form');
    const fields = document.getElementById('action-dialog-fields');
    const title = document.getElementById('action-dialog-title');
    const error = document.getElementById('action-dialog-error');
    const submit = document.getElementById('action-dialog-submit');

    if (!dialog || !form) return;

    let mode = '';
    let targetUrl = '';
    let editKind = '';
    let verifiedPassword = '';

    function resetForm() {

        form.reset();
        fields.replaceChildren();

        error.textContent = '';
        verifiedPassword = '';
        submit.disabled = false;

    }

    function closeDialog() {

        dialog.close();
        resetForm();

        mode = '';
        targetUrl = '';
        editKind = '';

    }

    function openDialog() {

        error.textContent = '';

        if (!dialog.open) {
            dialog.showModal();
        }

        fields.querySelector('input, textarea, select')?.focus();

    }

    function addField(labelText, name, type, value = '') {

        const label = document.createElement('label');
        label.textContent = labelText;

        let input;

        if (type === 'textarea') {

            input = document.createElement('textarea');
            input.rows = 5;
            input.maxLength = editKind === 'comment' ? 1000 : 3000;

        } else {

            input = document.createElement('input');
            input.type = type;

            if (type === 'password') {
                input.minLength = 4;
                input.maxLength = 72;
                input.autocomplete = 'current-password';
            }

            if (name === 'title') {
                input.maxLength = 120;
            }

        }

        input.name = name;
        input.value = value;
        input.required = true;

        label.appendChild(input);
        fields.appendChild(label);

        return input;

    }

    function addHidden(name, value) {

        const input = document.createElement('input');

        input.type = 'hidden';
        input.name = name;
        input.value = value;

        fields.appendChild(input);

    }

    function addPassword() {

        addField('등록 비밀번호', 'password', 'password');

    }

    function openEdit(button) {

        resetForm();

        mode = 'verify-edit';
        targetUrl = button.dataset.editUrl;
        editKind = button.dataset.editKind;

        title.textContent = '비밀번호 확인';
        submit.textContent = '확인';

        addPassword();
        openDialog();

    }

    function openDelete(button) {

        resetForm();

        mode = 'delete';
        targetUrl = button.dataset.deleteUrl;

        title.textContent = '삭제 확인';
        submit.textContent = '삭제';

        addPassword();
        openDialog();

    }

    function openReport(button) {

        resetForm();

        mode = 'report';
        targetUrl = '/report';

        title.textContent = '신고하기';
        submit.textContent = '신고';

        addHidden('type', button.dataset.reportType);
        addHidden('id', button.dataset.reportId);

        const label = document.createElement('label');
        label.textContent = '신고 사유';

        const select = document.createElement('select');
        select.name = 'reason';
        select.required = true;

        [
            '광고',
            '욕설',
            '부적절한 내용',
            '허위 정보',
            '기타'
        ].forEach(reason => {

            const option = document.createElement('option');

            option.value = reason;
            option.textContent = reason;

            select.appendChild(option);

        });

        label.appendChild(select);
        fields.appendChild(label);

        openDialog();

    }

    async function verifyEdit() {

        const password = form.elements.password.value;

        const response = await fetch(targetUrl + '/verify', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                password: password
            })

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || '비밀번호 확인에 실패했습니다.');
        }

        verifiedPassword = password;

        fields.replaceChildren();

        mode = 'save-edit';

        title.textContent = '내용 수정';
        submit.textContent = '저장';

        if (editKind === 'comment') {

            addField(
                '댓글 내용',
                'body',
                'textarea',
                result.body
            );

        } else {

            addField(
                '제목',
                'title',
                'text',
                result.title
            );

            addField(
                '내용',
                'description',
                'textarea',
                result.description
            );

            if (editKind === 'item') {

                const label = document.createElement('label');
                label.textContent = '시대';

                const select = document.createElement('select');
                select.name = 'era';

                [1960, 1970, 1980, 1990, 2000].forEach(year => {

                    const option = document.createElement('option');

                    option.value = year;
                    option.textContent = year + '년대';
                    option.selected = Number(result.era_id) === year;

                    select.appendChild(option);

                });

                label.appendChild(select);
                fields.appendChild(label);

            }

        }

        fields.querySelector('input, textarea')?.focus();

    }

    async function sendAction() {

        const data = new URLSearchParams(new FormData(form));

        if (mode === 'save-edit') {

            data.set('password', verifiedPassword);

        }

        const response = await fetch(targetUrl, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },

            body: data

        });

        if (!response.ok) {

            if (response.status === 403) {
                throw new Error('비밀번호가 일치하지 않습니다.');
            }

            if (response.status === 429) {
                throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도하세요.');
            }

            throw new Error('처리하지 못했습니다. 입력 내용을 확인하세요.');

        }

        verifiedPassword = '';

        if (response.redirected) {

            window.location.assign(response.url);

        } else {

            window.location.reload();

        }

    }

    document.addEventListener('click', event => {

        const button = event.target.closest('button');

        if (!button) return;

        if (button.dataset.editUrl) {

            openEdit(button);

        } else if (button.dataset.deleteUrl) {

            openDelete(button);

        } else if (button.dataset.reportType) {

            openReport(button);

        }

    });

    form.addEventListener('submit', async event => {

        event.preventDefault();

        error.textContent = '';
        submit.disabled = true;

        try {

            if (mode === 'verify-edit') {

                await verifyEdit();

            } else {

                await sendAction();

            }

        } catch (err) {

            error.textContent = err.message;

        } finally {

            submit.disabled = false;

        }

    });

    document.getElementById('action-dialog-close')
        .addEventListener('click', closeDialog);

    document.getElementById('action-dialog-cancel')
        .addEventListener('click', closeDialog);

    dialog.addEventListener('close', resetForm);

});