
        const uploadedFiles = {
            cv: null,
            certifications: null,
            identification: null
        };

        function switchTab(tab) {
            document.querySelectorAll('.tab-container .tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            document.querySelectorAll('.form-container').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(tab + '-form').classList.add('active');

            if (tab === 'login') {
                document.getElementById('auth-title').textContent = 'Acceso al Sistema';
                document.getElementById('auth-subtitle').textContent = 'Seleccione su perfil e ingrese sus credenciales';
            } else {
                document.getElementById('auth-title').textContent = 'Registro de Usuario';
                document.getElementById('auth-subtitle').textContent = 'Complete el formulario para crear su cuenta';
            }

            $('#loginForm').parsley().reset();
            $('#registerForm').parsley().reset();
        }

        function switchUserType(type) {
            const buttons = document.querySelectorAll('#login-form .tab-nav .tab-button');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }

        function switchRegisterType(type) {
            const buttons = document.querySelectorAll('#register-form .tab-nav .tab-button');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const experienceGroup = document.getElementById('experienceGroup');
            const experienceSelect = document.getElementById('experience');
            
            if (type === 'instructor') {
                experienceGroup.style.display = 'block';
                experienceSelect.setAttribute('required', '');
                experienceSelect.setAttribute('data-parsley-required', '');
            } else {
                experienceGroup.style.display = 'none';
                experienceSelect.removeAttribute('required');
                experienceSelect.removeAttribute('data-parsley-required');
            }

            $('#registerForm').parsley().refresh();
        }

        function showAlert(type, message) {
            document.querySelectorAll('.alert').forEach(alert => alert.remove());

            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.innerHTML = `
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
                ${message}
            `;
            
            const form = document.querySelector('.form-container.active');
            form.insertBefore(alertDiv, form.firstChild);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }

        function simulateProgress(progressBar, callback) {
            let progress = 0;
            progressBar.parentElement.classList.add('show');
            
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        progressBar.parentElement.classList.remove('show');
                        if (callback) callback();
                    }, 500);
                }
                progressBar.style.width = progress + '%';
            }, 100);
        }

        function validateFile(file, maxSize) {
            if (!file) return false;

            if (file.type !== 'application/pdf') {
                return { valid: false, message: 'Solo se permiten archivos PDF' };
            }

            if (file.size > maxSize) {
                const maxSizeMB = maxSize / (1024 * 1024);
                return { valid: false, message: `El archivo excede el tamaño máximo de ${maxSizeMB}MB` };
            }

            return { valid: true };
        }

        function handleFileSelect(dropzone, file) {
            const fileType = dropzone.dataset.fileType;
            const maxSize = parseInt(dropzone.dataset.maxSize);
            const validation = validateFile(file, maxSize);

            if (!validation.valid) {
                dropzone.classList.add('error');
                dropzone.classList.remove('has-file');
                const fileText = dropzone.querySelector('.file-text');
                fileText.innerHTML = `<strong style="color: var(--error);">Error</strong><br><small>${validation.message}</small>`;
                setTimeout(() => {
                    dropzone.classList.remove('error');
                    resetDropzone(dropzone);
                }, 3000);
                return;
            }

            const progressBar = dropzone.querySelector('.file-progress-bar');
            const fileText = dropzone.querySelector('.file-text');
            const originalTitle = dropzone.querySelector('strong').textContent;

            simulateProgress(progressBar, () => {
                dropzone.classList.add('has-file');
                dropzone.classList.remove('error');
                uploadedFiles[fileType] = file;
                fileText.innerHTML = `<strong>${originalTitle}</strong><br><small>${file.name}</small>`;
            });
        }

        function resetDropzone(dropzone) {
            const fileType = dropzone.dataset.fileType;
            const originalTitle = dropzone.querySelector('strong').textContent;
            const fileText = dropzone.querySelector('.file-text');
            const maxSize = parseInt(dropzone.dataset.maxSize);
            const maxSizeMB = maxSize / (1024 * 1024);

            fileText.innerHTML = `<strong>${originalTitle}</strong><br><small>Arrastra tu archivo PDF aquí o haz clic para seleccionar<br>(máx. ${maxSizeMB}MB)</small>`;
            dropzone.classList.remove('has-file', 'error');
            uploadedFiles[fileType] = null;
        }

        function removeFile(fileType) {
            const dropzone = document.querySelector(`[data-file-type="${fileType}"]`);
            resetDropzone(dropzone);
        }

        function initFileDropzones() {
            const dropzones = document.querySelectorAll('.file-dropzone');

            dropzones.forEach(dropzone => {
                const fileInput = dropzone.querySelector('.file-input');

                dropzone.addEventListener('click', (e) => {
                    if (e.target.classList.contains('file-remove') || e.target.closest('.file-remove')) {
                        return;
                    }
                    fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        handleFileSelect(dropzone, e.target.files[0]);
                    }
                });

                dropzone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropzone.classList.add('dragover');
                });

                dropzone.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('dragover');
                });

                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('dragover');
                    
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                        handleFileSelect(dropzone, files[0]);
                    }
                });
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
            initFileDropzones();

            window.Parsley.addValidator('notequalto', {
                requirementType: 'string',
                validateString: function(value, requirement) {
                    const otherValue = $(requirement).val();
                    return value !== otherValue;
                },
                messages: {
                    es: 'Los correos deben ser diferentes'
                }
            });

            $('#loginForm').on('submit', function(e) {
                e.preventDefault();
                
                if ($(this).parsley().isValid()) {
                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    
                    submitBtn.classList.add('btn-loading');
                    submitBtn.innerHTML = '<div class="spinner"></div> Verificando...';
                    
                    setTimeout(() => {
                        showAlert('success', '¡Inicio de sesión exitoso! Redirigiendo...');
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.innerHTML = originalText;
                        
                        setTimeout(() => {
                            // window.location.href = '/dashboard';
                        }, 2000);
                    }, 2000);
                }
            });

            $('#registerForm').on('submit', function(e) {
                e.preventDefault();
                
                if (!$(this).parsley().isValid()) {
                    showAlert('error', 'Por favor corrija los errores en el formulario');
                    return;
                }

                const requiredFiles = ['cv', 'identification'];
                const missingFiles = requiredFiles.filter(fileType => !uploadedFiles[fileType]);
                
                if (missingFiles.length > 0) {
                    const fileNames = {
                        cv: 'Curriculum Vitae',
                        identification: 'Identificación Oficial',
                        certifications: 'Certificaciones'
                    };
                    const missing = missingFiles.map(f => fileNames[f]).join(', ');
                    showAlert('error', `Faltan los siguientes documentos: ${missing}`);
                    return;
                }

                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.classList.add('btn-loading');
                submitBtn.innerHTML = '<div class="spinner"></div> Procesando registro...';
                
                setTimeout(() => {
                    showAlert('success', '¡Registro completado exitosamente! Revise su correo para activar su cuenta.');
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerHTML = originalText;
                    
                    this.reset();
                    $(this).parsley().reset();
                    
                    Object.keys(uploadedFiles).forEach(fileType => {
                        removeFile(fileType);
                    });
                }, 3000);
            });

            $('#registerForm input, #registerForm select').on('input change', function() {
                $(this).parsley().validate();
            });

            $('#loginForm input').on('input', function() {
                $(this).parsley().validate();
            });
        });