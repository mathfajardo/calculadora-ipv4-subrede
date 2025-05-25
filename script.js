 function calcular(event) {
            event.preventDefault();

            const ip = document.getElementById('ip').value.trim();
            const mask = document.getElementById('subrede').value.trim();

            const ipParts = ip.split('.').map(Number);
            const maskParts = mask.split('.').map(Number);

            // validação
            if (ipParts.length !== 4 || maskParts.length !== 4 || 
                ipParts.some(p => isNaN(p) || p < 0 || p > 255) || 
                maskParts.some(p => isNaN(p) || p < 0 || p > 255)) {
                alert("IP ou máscara inválidos. Use o formato xxx.xxx.xxx.xxx com valores de 0 a 255.");
                return;
            }
            if (!isValidSubnetMask(maskParts)) {
                alert("Máscara de sub-rede inválida. Os bits da máscara devem ser contíguos.");
                return;
            }

            // converter para binario
            const ipBin = ipParts.map(p => p.toString(2).padStart(8, '0')).join('');
            const maskBin = maskParts.map(p => p.toString(2).padStart(8, '0')).join('');

            // calcular endereço de rede
            const networkBin = bitwiseAnd(ipBin, maskBin);
            
            // calcular endereço de broadcast
            const broadcastBin = calculateBroadcast(networkBin, maskBin);

            // calcular número de hosts
            const hostBits = maskBin.split('').filter(bit => bit === '0').length;
            const totalHosts = Math.pow(2, hostBits);
            const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

            // converter para formato decimal
            const networkIP = binToIp(networkBin);
            const broadcastIP = binToIp(broadcastBin);
            
            // calcular faixa de ip utilizável
            const rangeStart = usableHosts > 0 ? ipIncrement(networkIP, 1) : networkIP;
            const rangeEnd = usableHosts > 0 ? ipIncrement(broadcastIP, -1) : networkIP;

            // exibir o resultado
            const tabela = document.getElementById("resultado");
            tabela.innerHTML = `
                <tr>
                    <td>${usableHosts > 0 ? `${rangeStart} - ${rangeEnd}` : 'N/A'}</td>
                    <td>${broadcastIP}</td>
                    <td>${totalHosts}</td>
                    <td>${usableHosts}</td>
                    <td>${networkIP}</td>
                </tr>
            `;
        }

        // verifica se a mascara de subrede é valida
        function isValidSubnetMask(maskParts) {
            const maskBin = maskParts.map(p => p.toString(2).padStart(8, '0')).join('');
            const regex = /^1*0*$/; 
            return regex.test(maskBin);
        }

        // realiza AND bit a bit entre IP e máscara (binários)
        function bitwiseAnd(ipBin, maskBin) {
            return ipBin.split('').map((bit, i) => (parseInt(bit) & parseInt(maskBin[i])).toString()).join('');
        }

        // calcula o endereço de broadcast a partir da rede e máscara
        function calculateBroadcast(networkBin, maskBin) {
            return networkBin.split('').map((bit, i) => maskBin[i] === '1' ? bit : '1').join('');
        }

        // converte uma string binária de 32 bits para o formato IP decimal
        function binToIp(bin) {
            return [
                parseInt(bin.slice(0, 8), 2),
                parseInt(bin.slice(8, 16), 2),
                parseInt(bin.slice(16, 24), 2),
                parseInt(bin.slice(24, 32), 2)
            ].join('.');
        }

        // incrementa um endereço IP decimal por um offset numérico
        function ipIncrement(ip, offset) {
            const parts = ip.split('.').map(Number);
            let total = ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
            total = (total + offset) >>> 0; 
            
            return [
                (total >>> 24) & 255,
                (total >>> 16) & 255,
                (total >>> 8) & 255,
                total & 255
            ].join('.');
        }
